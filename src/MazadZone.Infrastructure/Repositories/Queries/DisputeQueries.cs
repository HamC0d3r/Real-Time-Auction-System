namespace  MazadZone.Infrastructure.Repositories.Queries;

using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Dapper;
using MazadZone.Application.Common.Interfaces;
using MazadZone.Application.Common.Paging;
using MazadZone.Application.Features.Disputes.Queries;
using MazadZone.Application.Features.Disputes.Queries.GetOpenDisputesBreakdown;
using MazadZone.Domain.Orders;
using Polly;

public class DisputeQueries : ResilientRepository, IDisputeQueries
{
    public DisputeQueries(ISqlConnectionFactory sqlFactory, IAsyncPolicy resiliencePolicy)
        : base(sqlFactory, resiliencePolicy) { }

    public async Task<DisputeDetailsDto?> GetDetailsByIdAsync(DisputeId disputeId, CancellationToken ct)
    {
        // 1. We use ALIASES (AS) so every column has a unique, predictable name
        var mainSql = @"
        SELECT
            d.Id, 
            CASE d.Status
                WHEN 1 THEN 'Open'
                WHEN 2 THEN 'UnderReview'
                WHEN 3 THEN 'Resolved'
                ELSE 'Unknown'
            END AS Status, 

            dt.Name AS DisputeType, 
            d.Title, 
            d.Description,
            
            -- Auction Info Aliases
            a.Id AS AuctionId, 
            i.Title AS AuctionTitle, 
            a.EndTime, 
            o.TotalAmount AS FinalPrice,
            (SELECT ImageUrl From ItemImages WHERE ItemId = i.Id AND IsMain = true LIMIT 1) AS MainImageUrl,
            
            -- Bidder Info Aliases
            bidder.Id AS BidderId, 
            bidder.FirstName + ' ' + bidder.LastName AS BidderName, 
            bidder.Email AS BidderEmail,

            -- Seller Info Aliases
            seller.Id AS SellerId, 
            seller.FirstName + ' ' + seller.LastName AS SellerName, 
            seller.Email AS SellerEmail

        FROM Disputes d 
        LEFT JOIN DisputeTypes dt ON d.DisputeTypeId = dt.Id
        LEFT JOIN Orders o ON d.OrderId = o.Id
        LEFT JOIN Auctions a ON o.AuctionId = a.Id
        LEFT JOIN Items i ON a.Id = i.AuctionId
        LEFT JOIN Users bidder ON o.BidderId = bidder.Id
        LEFT JOIN Users seller ON a.SellerId = seller.Id
        WHERE d.Id = @DisputeId
    ";

        var imagesSql = @"
        SELECT ImageUrl AS Path, AltText 
        FROM DisputeImages
        WHERE DisputeId = @DisputeId;
    ";

        return await ExecuteResilientAsync(async connection =>
        {
            // STEP 1: Query the main row as a 'dynamic' object
            var row = await connection.QueryFirstOrDefaultAsync<dynamic>(mainSql, new { DisputeId = disputeId.Value });

            if (row is null) return null;

            // STEP 2: Query the attachments directly into your DTO
            var attachments = await connection.QueryAsync<DisputeAttachmentDto>(imagesSql, new { DisputeId = disputeId.Value });

            // STEP 3: Manually map the dynamic row directly into your strict records
            // STEP 3: Manually map the dynamic row directly into your strict records
            return new DisputeDetailsDto(
                Id: (Guid?)row.Id ?? Guid.Empty,
                Status: row.Status is null ? "Unknown" : ((object)row.Status).ToString()!,
                DisputeType: (string?)row.DisputeType ?? "Unknown",
                Title: (string?)row.Title ?? string.Empty,
                Description: (string?)row.Description ?? string.Empty,

                AuctionDetails: new AuctionDisputeInfo
                {
                    Id = (Guid?)row.AuctionId ?? Guid.Empty,
                    Title = (string?)row.AuctionTitle ?? string.Empty,
                    FinalPrice = (decimal?)row.FinalPrice ?? 0m,
                    EndTime = (DateTime?)row.EndTime ?? DateTime.MinValue,
                    MainImageUrl = (string?)row.MainImageUrl ?? string.Empty
                },

                Parties: new List<DisputeParties>
                {
        new DisputeParties
        {
            Bidder = new DisputeUserDto
            {
                Id = (Guid?)row.BidderId ?? Guid.Empty,
                Name = (string?)row.BidderName ?? "Unknown Bidder",
                Email = (string?)row.BidderEmail ?? string.Empty
            },
            Seller = new DisputeUserDto
            {
                Id = (Guid?)row.SellerId ?? Guid.Empty,
                Name = (string?)row.SellerName ?? "Unknown Seller",
                Email = (string?)row.SellerEmail ?? string.Empty
            }
        }
                },

                Attachments: attachments?.ToList() ?? new List<DisputeAttachmentDto>()
            );
        });
    }

    public async Task<PagedList<DisputeListItemDto>> GetFilteredDisputesAsync(DisputeFilterParams filters, CancellationToken ct)
{
    var parameters = new DynamicParameters();

    // 1. Build the shared FROM and WHERE clauses to be used by both COUNT and SELECT
    var filterConditions = new StringBuilder(@"
    FROM Disputes d
    JOIN DisputeTypes dt ON d.DisputeTypeId = dt.Id
    JOIN Orders o ON d.OrderId = o.Id
    JOIN Auctions a ON o.AuctionId = a.Id
    JOIN Users bidder ON o.BidderId = bidder.Id
    JOIN Users seller ON a.SellerId = seller.Id
    WHERE 1 = 1 ");

    // 2. Conditionally append filters
    if (!string.IsNullOrWhiteSpace(filters.SearchTerm))
    {
        // Searches across Bidder Name, Seller Name, and Category
        filterConditions.Append(@" AND (
        bidder.FirstName LIKE @Search OR 
        bidder.LastName LIKE @Search OR 
        seller.FirstName LIKE @Search OR 
        seller.LastName LIKE @Search OR
        dt.Name LIKE @Search)");

        parameters.Add("Search", $"%{filters.SearchTerm}%");
    }

    if (!string.IsNullOrWhiteSpace(filters.Status))
    {
        // Check if the string matches an actual defined name in the enum (case-insensitively)
        bool isDefinedName = Enum.GetNames<DisputeStatus>()
            .Any(name => string.Equals(name, filters.Status, StringComparison.OrdinalIgnoreCase));

        if (isDefinedName && Enum.TryParse<DisputeStatus>(filters.Status, ignoreCase: true, out var statusEnum))
        {
            filterConditions.Append(" AND d.Status = @Status ");
            parameters.Add("Status", (int)statusEnum);
        }
    }

    if (filters.CategoryId.HasValue)
    {
        filterConditions.Append(" AND d.DisputeTypeId = @CategoryId ");
        parameters.Add("CategoryId", filters.CategoryId.Value);
    }

    if (filters.FromDate.HasValue)
    {
        filterConditions.Append(" AND d.CreatedAtUtc >= @FromDate ");
        parameters.Add("FromDate", filters.FromDate.Value);
    }

    if (filters.ToDate.HasValue)
    {
        filterConditions.Append(" AND d.CreatedAtUtc <= @ToDate ");
        parameters.Add("ToDate", filters.ToDate.Value);
    }

    // 3. Build Count Query String
    var countSql = $"SELECT COUNT(1) {filterConditions}";

    // 4. Build Data Query String
    var dataSqlBuilder = new StringBuilder($@"
    SELECT 
        d.Id,
        (bidder.FirstName + ' ' + bidder.LastName) AS BidderName,
        (seller.FirstName + ' ' + seller.LastName) AS SellerName,
        dt.Name AS Category,
        CASE d.Status
            WHEN 1 THEN 'Open'
            WHEN 2 THEN 'UnderReview'
            WHEN 3 THEN 'Resolved'
            ELSE 'Unknown'
        END AS Status,
        d.CreatedAtUtc AS SubmittedDate
    {filterConditions}");

    // Apply Safe Sorting
    var sortString = filters.SortColumn?.ToLower() switch
    {
        "category" => "dt.Name",
        "status" => "d.Status",
        "biddername" => "BidderName",
        "sellername" => "SellerName",
        _ => "d.CreatedAtUtc" // Default sort
    };

    var direction = filters.IsDescending ? "DESC" : "ASC";
    dataSqlBuilder.Append($" ORDER BY {sortString} {direction}");

    // Apply Pagination Limits if not exporting
    if (!filters.IsExport)
    {
        dataSqlBuilder.Append(" OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY");
        parameters.Add("Offset", (filters.PageNumber - 1) * filters.PageSize);
        parameters.Add("PageSize", filters.PageSize);
    }

    // 5. Combine commands or stream multi-results
    return await ExecuteResilientAsync(async connection =>
    {
        if (!filters.IsExport)
        {
            var combinedSql = $"{countSql}; {dataSqlBuilder}";

            var command = new CommandDefinition(combinedSql, parameters, cancellationToken: ct);
            using var multi = await connection.QueryMultipleAsync(command);

            int totalCount = await multi.ReadFirstAsync<int>();
            var items = (await multi.ReadAsync<DisputeListItemDto>()).ToList();

            return new PagedList<DisputeListItemDto>(items, filters.PageNumber, filters.PageSize, totalCount);
        }
        else
        {
            // If exporting, skip pagination metrics entirely to maximize performance
            var command = new CommandDefinition(dataSqlBuilder.ToString(), parameters, cancellationToken: ct);
            var items = (await connection.QueryAsync<DisputeListItemDto>(command)).ToList();

            return new PagedList<DisputeListItemDto>(items, 1, items.Count, items.Count);
        }
    });
}

   public async Task<IReadOnlyList<RawDisputeBreakdown>> GetOpenDisputesBreakdownAsync(
    DateTime currStart, DateTime currEnd,
    DateTime prevStart, DateTime prevEnd,
    int limit,
    bool includeOther,
    CancellationToken ct)
{
    var sql = @"
        WITH BreakdownData AS (
            SELECT 
                dt.Name AS DisputeTypeName,
                SUM(CASE WHEN d.Id IS NOT NULL AND d.CreatedAtUtc >= @CurrStart AND d.CreatedAtUtc < @CurrEnd THEN 1 ELSE 0 END) AS CurrentCases,
                SUM(CASE WHEN d.Id IS NOT NULL AND d.CreatedAtUtc >= @PrevStart AND d.CreatedAtUtc < @PrevEnd THEN 1 ELSE 0 END) AS PreviousCases
            FROM DisputeTypes dt
            LEFT JOIN Disputes d ON dt.Id = d.DisputeTypeId AND d.Status = @OpenStatus
            GROUP BY dt.Name
            HAVING 
                SUM(CASE WHEN d.Id IS NOT NULL AND d.CreatedAtUtc >= @CurrStart AND d.CreatedAtUtc < @CurrEnd THEN 1 ELSE 0 END) > 0
                OR 
                SUM(CASE WHEN d.Id IS NOT NULL AND d.CreatedAtUtc >= @PrevStart AND d.CreatedAtUtc < @PrevEnd THEN 1 ELSE 0 END) > 0
        ),
        RankedData AS (
            SELECT 
                DisputeTypeName,
                CurrentCases,
                PreviousCases,
                ROW_NUMBER() OVER(ORDER BY CurrentCases DESC, DisputeTypeName ASC) AS Rnk
            FROM BreakdownData
        )
        
        SELECT 
            DisputeTypeName,
            CurrentCases,
            PreviousCases,
            IsOtherBucket
        FROM (
            -- Always select the Top N
            SELECT 
                DisputeTypeName,
                CurrentCases,
                PreviousCases,
                CAST(0 AS BIT) AS IsOtherBucket, -- FIX: Explicitly cast to BIT
                Rnk AS SortOrder
            FROM RankedData
            WHERE Rnk <= @Limit
    ";

    if (includeOther)
    {
        sql += @"
            UNION ALL

            -- Aggregate everything else into 'Other'
            SELECT 
                'Other' AS DisputeTypeName,
                SUM(CurrentCases) AS CurrentCases,
                SUM(PreviousCases) AS PreviousCases,
                CAST(1 AS BIT) AS IsOtherBucket, -- FIX: Explicitly cast to BIT
                @Limit + 1 AS SortOrder
            FROM RankedData
            WHERE Rnk > @Limit
            HAVING COUNT(*) > 0 
        ";
    }

    sql += @"
        ) FinalResult
        ORDER BY SortOrder ASC;
    ";

    return await ExecuteResilientAsync(async connection =>
    {
        var parameters = new
        {
            CurrStart = currStart,
            CurrEnd = currEnd,
            PrevStart = prevStart,
            PrevEnd = prevEnd,
            Limit = limit,
            OpenStatus = (int)DisputeStatus.Open
        };

        var command = new CommandDefinition(sql, parameters, cancellationToken: ct);
        var result = await connection.QueryAsync<RawDisputeBreakdown>(command);

        return result.ToList().AsReadOnly();
    });
}

    public async Task<IReadOnlyList<DisputeListItemDto>> ExportSelectedDisputesAsync(IEnumerable<Guid> disputeIds, CancellationToken ct)
    {
        var sql = @"
    SELECT 
        d.Id,
        bidder.FirstName + ' ' + bidder.LastName AS BidderName,
        seller.FirstName + ' ' + seller.LastName AS SellerName,
        dt.Name AS Category,
        CASE d.Status
            WHEN 1 THEN 'Open'
            WHEN 2 THEN 'UnderReview'
            WHEN 3 THEN 'Resolved'
            ELSE 'Unknown'
        END AS Status,
        d.CreatedAtUtc AS SubmittedDate
    FROM Disputes d
    JOIN DisputeTypes dt ON d.DisputeTypeId = dt.Id
    JOIN Orders o ON d.OrderId = o.Id
    JOIN Auctions a ON o.AuctionId = a.Id
    JOIN Users bidder ON o.BidderId = bidder.Id
    JOIN Users seller ON a.SellerId = seller.Id
    WHERE d.Id IN @DisputeIds
    ORDER BY d.CreatedAtUtc DESC"; // Default safe sorting for exports

        return await ExecuteResilientAsync(async connection =>
        {
            var command = new CommandDefinition(sql, new { DisputeIds = disputeIds }, cancellationToken: ct);
            var result = await connection.QueryAsync<DisputeListItemDto>(command);

            return result.ToList().AsReadOnly();
        });
    }

}