using System.Text;
using Dapper;
using MazadZone.Application.Common.Interfaces;
using MazadZone.Application.Common.Paging;
using MazadZone.Application.Features.Bidders.DTOs;
using MazadZone.Application.Features.Users.DTOs;
using MazadZone.Application.Features.Users.Queries.GetProfileSettings;
using MazadZone.Application.Features.Users.Queries.GetPaymentMethods;
using MazadZone.Application.Features.Users.Queries.GetUserGrowthTrends;
using MazadZone.Application.Features.Users.Queries.GetUserTrustStats;
using MazadZone.Application.Services;
using MazadZone.Domain.Primitives.Results;
using MazadZone.Domain.Shared.ValueObjects;
using MazadZone.Domain.Users;
using MazadZone.Domain.Users.ValueObjects;
using Polly;

namespace MazadZone.Infrastructure.Repositories.Queries;

public class UserQueries : ResilientRepository, IUserQueries
{
    public UserQueries(ISqlConnectionFactory sqlFactory, IAsyncPolicy resiliencePolicy) : base(sqlFactory, resiliencePolicy) { }

    public async Task<Result<Address>> GetAddressByIdAsync(Guid userId, CancellationToken cancellationToken)
    {
        const string sql = @"
            SELECT TOP 1
                City,
                Street,
                Building,
                Landmark
            FROM BidderAddresses
            WHERE BidderId = @UserId
            ORDER BY IsDefault DESC;
        ";

        var addressDto = await ExecuteResilientAsync(connection =>
            connection.QueryFirstOrDefaultAsync<AddressDto>(sql, new { UserId = userId }));

        if (addressDto is null)
        {
            return Result.Failure<Address>(Error.NotFound("Address.NotFound", "Address not found for the user."));
        }

        return Address.Create(addressDto.City, addressDto.Street, addressDto.Building, addressDto.Landmark);
    }

    public async Task<Result<Email>> GetEmailByIdAsync(Guid userId, CancellationToken cancellationToken)
    {
        var sql = @"
            SELECT Email
            FROM Users
            WHERE Id = @userId
        ";

        var email = await ExecuteResilientAsync(connection =>
            connection.QueryFirstOrDefaultAsync<string>(sql, new { userId = userId }));

        return Email.Create(email);
    }

    public async Task<ProfileSettingsResponse?> GetProfileSettings(UserId userId, CancellationToken cancellationToken)
    {
        const string sql = @"
            SELECT 
                u.Id,
                u.FirstName + ' ' + u.LastName AS FullName,
                u.Email,
                u.PhoneNumber,
                bv.NationalId AS NationalId,
                ba.City,
                ba.Street,
                ba.Building,
                ba.Landmark,
                CASE bv.Status 
                    WHEN 1 THEN 'Pending' 
                    WHEN 2 THEN 'Verified' 
                    WHEN 3 THEN 'Rejected' 
                    ELSE 'Unverified' 
                END AS VerificationStatus,
                bv.ExtractedFullName,
                bv.RejectionReason AS VerificationRejectionReason
            FROM Users u
            LEFT JOIN Bidders b ON b.Id = u.Id
            LEFT JOIN BidderVerifications bv ON bv.BidderId = b.Id
            JOIN BidderAddresses ba ON ba.BidderId = b.Id
            WHERE u.Id = @UserId;
            ";

        return await ExecuteResilientAsync(connection =>
               connection.QueryFirstOrDefaultAsync<ProfileSettingsResponse>(sql, new { UserId = userId.Value })
        );
    }

    public async Task<IReadOnlyList<PaymentMethodResponse>> GetPaymentMethodsAsync(UserId userId, CancellationToken ct)
    {
        const string sql = @"
            SELECT 
                Id,
                Last4Digits,
                ExpiryMonth,
                ExpiryYear,
                CardholderName,
                Brand,
                IsDefault,
                CreatedOnUtc
            FROM PaymentMethods
            WHERE UserId = @UserId
            ORDER BY IsDefault DESC, CreatedOnUtc DESC;
        ";

        return await ExecuteResilientAsync(async connection =>
        {
            var command = new CommandDefinition(sql, new { UserId = userId.Value }, cancellationToken: ct);
            var results = await connection.QueryAsync<PaymentMethodResponse>(command);
            return results.ToList().AsReadOnly();
        });
    }

    public async Task<PagedList<UserDto>?> GetUsersAsync(UserFilterParams filter, CancellationToken ct)
    {
        var parameters = new DynamicParameters();

        // 1. Build the shared WHERE clause filters
        var filterConditions = new StringBuilder(" WHERE 1 = 1 ");

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            filterConditions.Append(@" 
        AND (FirstName LIKE @Search 
             OR LastName LIKE @Search 
             OR Email LIKE @Search 
             OR PhoneNumber LIKE @Search)");
            parameters.Add("Search", $"%{filter.SearchTerm}%");
        }

        // 💡 Change filter.JoinedDate to filter.ValidJoinedDate
        if (filter.ValidJoinedDate.HasValue)
        {
            // 💡 Access the DateTime value from ValidJoinedDate instead
            var startDate = filter.ValidJoinedDate.Value.Date;
            var endDate = startDate.AddDays(1);

            filterConditions.Append(" AND Users.CreatedOnUtc >= @StartDate AND Users.CreatedOnUtc < @EndDate");
            parameters.Add("StartDate", startDate);
            parameters.Add("EndDate", endDate);
        }

        // 2. Build Count Query String
        var countSql = $"SELECT COUNT(1) FROM Users {filterConditions}";

        // 3. Build Data Query String
        var dataSqlBuilder = new StringBuilder($@"
    SELECT 
        Users.Id,
        (FirstName + ' ' + LastName) AS FullName,
        Email,
        PhoneNumber,
        CASE 
            WHEN (Roles & 4) = 4 THEN 'Admin'
            WHEN (Roles & 2) = 2 THEN 'Seller'
            WHEN (Roles & 1) = 1 THEN 'Bidder'
            ELSE 'None'
        END AS Role,
        CASE Status
            WHEN 1 THEN 'Active'
            WHEN 2 THEN 'Suspended'
            WHEN 3 THEN 'Banned'
            ELSE 'Unknown'
        END AS Status,
        Users.CreatedOnUtc AS JoinedAt,
        LastLogin,
        CASE bv.Status 
            WHEN 1 THEN 'Pending' 
            WHEN 2 THEN 'Verified' 
            WHEN 3 THEN 'Rejected' 
            ELSE 'Unverified' 
        END AS VerificationStatus,
        bv.NationalId,
        bv.ExtractedFullName,
        bv.RejectionReason AS VerificationRejectionReason
    FROM Users
    LEFT JOIN Bidders b ON b.Id = Users.Id
    LEFT JOIN BidderVerifications bv ON bv.BidderId = b.Id
    {filterConditions}");

        // Apply Sorting Rules
        var sortColumn = filter.SortBy?.ToLower() switch
        {
            "fullname" => "(FirstName + ' ' + LastName)",
            "joineddate" => "Users.CreatedOnUtc",
            "lastlogin" => "LastLogin",
            "role" => "Roles",
            "status" => "Status",
            _ => "Users.CreatedOnUtc"
        };
        var sortDirection = filter.IsAsc ? "ASC" : "DESC";
        dataSqlBuilder.Append($" ORDER BY {sortColumn} {sortDirection}");

        // Apply Pagination Limits if not exporting
        if (!filter.IsExport)
        {
            dataSqlBuilder.Append(" OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY");
            parameters.Add("Offset", (filter.PageNumber - 1) * filter.PageSize);
            parameters.Add("PageSize", filter.PageSize);
        }

        // 4. Combine commands or stream multi-results
        return await ExecuteResilientAsync(async connection =>
        {
            if (!filter.IsExport)
            {
                var combinedSql = $"{countSql}; {dataSqlBuilder}";

                var command = new CommandDefinition(combinedSql, parameters, cancellationToken: ct);
                using var multi = await connection.QueryMultipleAsync(command);

                int totalCount = await multi.ReadFirstAsync<int>();
                var items = (await multi.ReadAsync<UserDto>()).ToList();

                // 💡 Instantiates your exact class constructor logic flawlessly
                return new PagedList<UserDto>(items, filter.PageNumber, filter.PageSize, totalCount);
            }
            else
            {
                // If exporting, skip pagination metrics entirely to maximize performance
                var command = new CommandDefinition(dataSqlBuilder.ToString(), parameters, cancellationToken: ct);
                var items = (await connection.QueryAsync<UserDto>(command)).ToList();

                return new PagedList<UserDto>(items, 1, items.Count, items.Count);
            }
        });
    }

    public async Task<IReadOnlyList<UserDto>> ExportSelectedUsersAsync(IEnumerable<Guid> userIds, CancellationToken ct)
    {
        var sql = @"
    SELECT 
        Users.Id,
        (FirstName + ' ' + LastName) AS FullName,
        Email,
        PhoneNumber,
        CASE 
            WHEN (Roles & 4) = 4 THEN 'Admin'
            WHEN (Roles & 2) = 2 THEN 'Seller'
            WHEN (Roles & 1) = 1 THEN 'Bidder'
            ELSE 'None'
        END AS Role,
        CASE Status
            WHEN 1 THEN 'Active'
            WHEN 2 THEN 'Suspended'
            WHEN 3 THEN 'Banned'
            ELSE 'Unknown'
        END AS Status,
        Users.CreatedOnUtc AS JoinedAt,
        LastLogin,
        CASE bv.Status 
            WHEN 1 THEN 'Pending' 
            WHEN 2 THEN 'Verified' 
            WHEN 3 THEN 'Rejected' 
            ELSE 'Unverified' 
        END AS VerificationStatus,
        bv.NationalId,
        bv.ExtractedFullName,
        bv.RejectionReason AS VerificationRejectionReason
    FROM Users
    LEFT JOIN Bidders b ON b.Id = Users.Id
    LEFT JOIN BidderVerifications bv ON bv.BidderId = b.Id
    WHERE Users.Id IN @UserIds
    ORDER BY Users.CreatedOnUtc DESC"; // Default safe sorting for exports

        return await ExecuteResilientAsync(async connection =>
        {
            var command = new CommandDefinition(sql, new { UserIds = userIds }, cancellationToken: ct);
            var result = await connection.QueryAsync<UserDto>(command);

            return result.ToList().AsReadOnly();
        });
    }

    public async Task<RawUserTrustMetrics> GetUserTrustMetricsAsync(
        DateTime currStart, DateTime currEnd,
        DateTime prevStart, DateTime prevEnd,
        CancellationToken ct)
    {
        // (Roles & 4) = 0 ensures no Admin users are included in ANY metric
        // CreatedOnUtc <= @CurrEnd ensures our "Total" counts don't accidentally include data beyond the requested end date
        var sql = @"
        SELECT 
            COUNT(1) AS TotalUsers,
            SUM(CASE WHEN (Roles & 2) = 2 THEN 1 ELSE 0 END) AS TotalSellers,
            SUM(CASE WHEN Status = 1 THEN 1 ELSE 0 END) AS ActiveAccounts,
            SUM(CASE WHEN Status = 2 THEN 1 ELSE 0 END) AS SuspendedAccounts,
            SUM(CASE WHEN Status = 3 THEN 1 ELSE 0 END) AS BannedAccounts,
            
            -- Metrics for the dynamic period Trust Score calculation
            SUM(CASE WHEN CreatedOnUtc >= @CurrStart AND CreatedOnUtc < @CurrEnd AND Status != 3 THEN 1 ELSE 0 END) AS CurrentPeriodGoodAccounts,
            SUM(CASE WHEN CreatedOnUtc >= @CurrStart AND CreatedOnUtc < @CurrEnd THEN 1 ELSE 0 END) AS CurrentPeriodTotalAccounts,
            
            SUM(CASE WHEN CreatedOnUtc >= @PrevStart AND CreatedOnUtc < @PrevEnd AND Status != 3 THEN 1 ELSE 0 END) AS PreviousPeriodGoodAccounts,
            SUM(CASE WHEN CreatedOnUtc >= @PrevStart AND CreatedOnUtc < @PrevEnd THEN 1 ELSE 0 END) AS PreviousPeriodTotalAccounts
        FROM Users
        WHERE (Roles & 4) = 0 
        AND CreatedOnUtc <= @CurrEnd;
    ";

        return await ExecuteResilientAsync(async connection =>
        {
            var parameters = new
            {
                CurrStart = currStart,
                CurrEnd = currEnd,
                PrevStart = prevStart,
                PrevEnd = prevEnd
            };

            var command = new CommandDefinition(sql, parameters, cancellationToken: ct);

            return await connection.QuerySingleAsync<RawUserTrustMetrics>(command);
        });
    }

    public async Task<UserGrowthDataResult> GetUserGrowthTrendsAsync(
        DateTime currStart, DateTime currEnd,
        DateTime prevStart, DateTime prevEnd,
        CancellationToken ct)
    {
        var sql = @"
        -- 1. Get the Overall Totals for Percentage Calculation
        SELECT 
            SUM(CASE WHEN CreatedOnUtc >= @CurrStart AND CreatedOnUtc < @CurrEnd THEN 1 ELSE 0 END) AS CurrTotalUsers,
            SUM(CASE WHEN CreatedOnUtc >= @CurrStart AND CreatedOnUtc < @CurrEnd AND (Roles & @SellerRole) = @SellerRole THEN 1 ELSE 0 END) AS CurrTotalSellers,
            
            SUM(CASE WHEN CreatedOnUtc >= @PrevStart AND CreatedOnUtc < @PrevEnd THEN 1 ELSE 0 END) AS PrevTotalUsers,
            SUM(CASE WHEN CreatedOnUtc >= @PrevStart AND CreatedOnUtc < @PrevEnd AND (Roles & @SellerRole) = @SellerRole THEN 1 ELSE 0 END) AS PrevTotalSellers
        FROM Users
        WHERE (Roles & @AdminRole) = 0; -- Exclude Admins

        -- 2. Get the Daily Grouped Data for the requested period
        SELECT 
            CAST(CreatedOnUtc AS DATE) AS DatePoint,
            COUNT(1) AS NewUsers,
            SUM(CASE WHEN (Roles & @SellerRole) = @SellerRole THEN 1 ELSE 0 END) AS NewSellers
        FROM Users
        WHERE (Roles & @AdminRole) = 0
          AND CreatedOnUtc >= @CurrStart AND CreatedOnUtc < @CurrEnd
        GROUP BY CAST(CreatedOnUtc AS DATE)
        ORDER BY DatePoint ASC;
    ";

        return await ExecuteResilientAsync(async connection =>
        {
            var parameters = new
            {
                CurrStart = currStart,
                CurrEnd = currEnd,
                PrevStart = prevStart,
                PrevEnd = prevEnd,

                // Cast the enums to integers so Dapper binds them safely to the SQL query
                SellerRole = (int)UserRole.Seller,
                AdminRole = (int)UserRole.Admin
            };

            using var multi = await connection.QueryMultipleAsync(new CommandDefinition(sql, parameters, cancellationToken: ct));

            var totals = await multi.ReadSingleAsync<RawUserGrowthTotals>();
            var dailyData = (await multi.ReadAsync<RawDailyUserGrowth>()).ToList();

            return new UserGrowthDataResult(totals, dailyData.AsReadOnly());
        });
    }

}