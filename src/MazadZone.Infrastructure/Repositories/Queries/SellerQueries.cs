using Dapper;
using MazadZone.Application.Common.Interfaces;
using MazadZone.Application.Features.Sellers.Queries;
using MazadZone.Application.Features.Sellers.Queries.GetPublicProfile;
using MazadZone.Application.Features.Sellers.Queries.GetUnverifiedSellers;
using MazadZone.Domain.Users.ValueObjects;
using Microsoft.Extensions.Logging;
using Polly;
using MazadZone.Application.Features.Orders.Queries.DTOs;
using MazadZone.Application.Common.Paging;

namespace MazadZone.Infrastructure.Repositories;

public sealed class SellerQueries : ResilientRepository, ISellerQueries
{
    public SellerQueries(ISqlConnectionFactory sqlFactory, IAsyncPolicy resiliencePolicy, ILogger<SellerQueries> logger) : base(sqlFactory, resiliencePolicy, logger)
    {
    }


    public async Task<PublicSellerProfileResponse?> GetSellerProfileSummaryAsync(UserId sellerId, CancellationToken ct)
{
    const string sql = @"
        SELECT 
            u.""Id"", 
            CONCAT(u.""FirstName"", ' ', u.""LastName"") AS ""FullName"",
            u.""Email"",
            u.""PhoneNumber"",
            s.""IsVerified"",
            u.""CreatedOnUtc"" AS ""MemberSince"",
            u.""LastLogin"",
            s.""Rating"", 
            s.""ReviewsCount"", 
            s.""ListedAuctionsCount"",
            COALESCE(b.""TotalPidsPlaced"", 0) AS ""TotalBidsPlaced"", 
            COALESCE(b.""AuctionParticipatedCount"", 0) AS ""AuctionParticipatedCount"",
            COALESCE(b.""AuctionsWonCount"", 0) AS ""AuctionsWonCount"",
            (SELECT COUNT(o.""Id"")::INT FROM ""Orders"" o JOIN ""Auctions"" a ON o.""AuctionId"" = a.""Id"" WHERE a.""SellerId"" = u.""Id"" AND o.""Status"" >= 2) AS ""CompletedPurchasesCount""
        FROM ""Users"" u 
        JOIN ""Sellers"" s ON u.""Id"" = s.""Id""
        LEFT JOIN ""Bidders"" b ON u.""Id"" = b.""Id"" 
        WHERE u.""Id"" = @SellerId;
    ";

    return await ExecuteResilientAsync(async (connection, ct) =>
    {
        return await connection.QuerySingleOrDefaultAsync<PublicSellerProfileResponse>(
            new CommandDefinition(sql, new { SellerId = sellerId.Value }, cancellationToken: ct)
        );
    }, ct);
}


    public async Task<PagedList<FeedbackDto>> GetSellerFeedbacksAsync(
        UserId sellerId,
        int page,
        int pageSize,
        CancellationToken ct)
    {
        const string sql = @"
        -- 1. Total Feedback Count
        SELECT COUNT(f.""Id"")
        FROM ""Orders"" o
        JOIN ""Feedbacks"" f ON o.""Id"" = f.""OrderId""
        JOIN ""Auctions"" a ON o.""AuctionId"" = a.""Id""
        WHERE a.""SellerId"" = @SellerId;

        -- 2. Paginated Data
        SELECT 
            o.""Id"",
            CONCAT(u.""FirstName"", ' ', u.""LastName"") AS ""AuthorName"",
            f.""Rating"",
            f.""Comment"",
            f.""Reply"",
            f.""CreatedAtUtc"" AS ""CreatedAt"",
            a.""Id"" AS ""AuctionId"",
            it.""Title"" AS ""AuctionTitle"",
            (SELECT img.""ImageUrl"" FROM ""ItemImages"" img WHERE img.""ItemId"" = it.""Id"" AND img.""IsMain"" = true LIMIT 1) AS ""AuctionImageUrl"",
            u.""Id"" AS ""AuthorId""
        FROM ""Orders"" o
        JOIN ""Feedbacks"" f ON o.""Id"" = f.""OrderId""
        JOIN ""Users"" u ON o.""BidderId"" = u.""Id"" 
        JOIN ""Auctions"" a ON o.""AuctionId"" = a.""Id""
        JOIN ""Items"" it ON it.""AuctionId"" = a.""Id""
        WHERE a.""SellerId"" = @SellerId
        ORDER BY f.""CreatedAtUtc"" DESC
        LIMIT @PageSize OFFSET @Offset;
    ";

        return await ExecuteResilientAsync(async (connection, ct) =>
        {
            var parameters = new
            {
                SellerId = sellerId.Value,
                Offset = (page - 1) * pageSize,
                PageSize = pageSize
            };

            using var multi = await connection.QueryMultipleAsync(
                new CommandDefinition(sql, parameters, cancellationToken: ct)
            );

            var totalCount = await multi.ReadSingleAsync<int>();
            var items = (await multi.ReadAsync<FeedbackDto>()).ToList();

            return new PagedList<FeedbackDto>(items.AsReadOnly(), page, pageSize, totalCount);
        }, ct);
    }

    public async Task<IReadOnlyList<UnverifiedSellerSummaryResponse>?> GetUnverifiedSellersAsync(CancellationToken ct)
    {
        const string sql = @"
            SELECT
                u.""Id"",
                CONCAT(u.""FirstName"", ' ', u.""LastName"") AS ""FullName"",
                u.""Email"",
                u.""PhoneNumber"",
                u.""CreatedOnUtc"" AS ""JoinedOn""
            FROM ""Sellers"" s
            JOIN ""Users"" u ON u.""Id"" = s.""Id""
            WHERE s.""IsVerified"" = false
            ORDER BY u.""CreatedOnUtc""
            ";

        return await ExecuteResilientAsync(async (connection, ct) =>
        {
            var result = await connection.QueryAsync<UnverifiedSellerSummaryResponse>(
                new CommandDefinition(sql, cancellationToken: ct));
            return result.AsList();
        }, ct);
    }


    private record ProfileBaseResult(
        Guid Id,
        string FullName,
        string Email,
        string PhoneNumber,
        bool IsVerified,
        DateTime MemberSince,
        DateTime LastLogin,
        decimal Rating,
        int ReviewsCount,
        int ListedAuctionsCount,
        int TotalBidsPlaced,
        int AuctionParticipatedCount,
        int AuctionsWonCount,
        int CompletedPurchasesCount
        );
}
