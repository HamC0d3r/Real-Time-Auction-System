using Dapper;
using MazadZone.Application.Common.Interfaces;
using MazadZone.Application.Features.Bidders.DTOs;
using MazadZone.Application.Services;
using MazadZone.Domain.Users.ValueObjects;
using Microsoft.Extensions.Logging;
using Polly;

namespace MazadZone.Infrastructure.Repositories.Queries;

public class BidderQueries : ResilientRepository, IBidderQueries
{
    public BidderQueries(ISqlConnectionFactory sqlFactory, IAsyncPolicy resiliencePolicy, ILogger<BidderQueries> logger) : base(sqlFactory, resiliencePolicy, logger)
    {
    }

    public async Task<BidderProfileDto?> GetBidderProfile(UserId bidderId, CancellationToken cancellationToken = default)
    {
        var query = @"
        SELECT 
    b.""Id"",
    CONCAT(u.""FirstName"", ' ', u.""LastName"") AS FullName,
    u.""Email"",
    u.""PhoneNumber"",

    -- Map the numeric status to a readable string
    CASE u.""Status""
        WHEN 1 THEN 'Active' 
        WHEN 2 THEN 'Suspended' 
        WHEN 3 THEN 'Banned' 
        ELSE 'UnKnown'
    END AS Status,

    bv.""IsVerified"",
    u.""CreatedOnUtc"" AS MemberSince,
    u.""LastLogin"",
    ba.""City"",
    ba.""Street"",
    ba.""Building"",
    ba.""Landmark"",
    
    -- Handle potential nulls
    COALESCE(b.""TotalPidsPlaced"", 0) AS TotalBidsPlaced,
    COALESCE(b.""AuctionParticipatedCount"", 0) AS AuctionParticipatedCount,
    COALESCE(b.""AuctionsWonCount"", 0) AS AuctionsWonCount,
    COALESCE(b.""CompletedPurchasesCount"", 0) AS CompletedPurchasesCount
FROM ""Bidders"" b
JOIN ""Users"" u ON b.""Id"" = u.""Id""
LEFT JOIN ""BidderVerifications"" bv ON b.""Id"" = bv.""BidderId""
JOIN ""BidderAddresses"" ba ON b.""Id"" = ba.""BidderId""
WHERE b.""Id"" = @bidderId;";

        return await ExecuteResilientAsync(async (connection, ct) =>
            await connection.QueryFirstOrDefaultAsync<BidderProfileDto>(
                new CommandDefinition(query, new { bidderId = bidderId.Value }, cancellationToken: ct)), cancellationToken);
    }
}