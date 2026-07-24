using Dapper;
using MazadZone.Application.Common.Interfaces;
using MazadZone.Application.Features.Dashboard.Queries.GetAuctionActivityTrends;
using MazadZone.Application.Services;
using MazadZone.Infrastructure.Database; // Adjust to your DbContext/Factory location

namespace MazadZone.Infrastructure.Queries;

public class DashboardQueries : IDashboardQueries
{
    private readonly ISqlConnectionFactory _sqlConnectionFactory;

    public DashboardQueries(ISqlConnectionFactory sqlConnectionFactory)
    {
        _sqlConnectionFactory = sqlConnectionFactory;
    }

    public async Task<(PeriodStats Current, PeriodStats Previous)> GetDashboardMetricsAsync(
        DateTime currStart, DateTime currEnd,
        DateTime prevStart, DateTime prevEnd,
        DateTime utcNow,
        CancellationToken ct)
    {
        // 1 = Pending, 2 = Active, 3 = Ended, 4 = Cancelled (Auctions)
        // 1 = Pending, 2 = Confirmed, 3 = Shipped, 4 = Delivered (Orders)
        // 1 = Open, 2 = UnderReview, 3 = Resolved (Disputes)

        var sql = @"
            -- CURRENT PERIOD
            SELECT 
                (SELECT COUNT(1) FROM ""Auctions"" WHERE CreatedOnUtc >= @CurrStart AND CreatedOnUtc < @CurrEnd) AS TotalAuctions,
                (SELECT COUNT(1) FROM ""Auctions"" WHERE Status = 2 AND CreatedOnUtc >= @CurrStart AND CreatedOnUtc < @CurrEnd) AS LiveAuctions,
                (SELECT COUNT(1) FROM ""Auctions"" WHERE EndTime > @UtcNow AND EndTime <= (@UtcNow + INTERVAL '24 hours')) AS EndingWithin24h,
                (SELECT COUNT(1) FROM ""Orders"" WHERE Status = 4 AND CreatedOnUtc >= @CurrStart AND CreatedOnUtc < @CurrEnd) AS CompletedOrders,
                (SELECT COUNT(1) FROM ""Disputes"" WHERE Status = 1 AND CreatedAtUtc >= @CurrStart AND CreatedAtUtc < @CurrEnd) AS OpenDisputes;

            -- PREVIOUS PERIOD
            SELECT 
                (SELECT COUNT(1) FROM ""Auctions"" WHERE CreatedOnUtc >= @PrevStart AND CreatedOnUtc < @PrevEnd) AS TotalAuctions,
                (SELECT COUNT(1) FROM ""Auctions"" WHERE Status = 2 AND CreatedOnUtc >= @PrevStart AND CreatedOnUtc < @PrevEnd) AS LiveAuctions,
                -- For the previous period 'Ending within 24h', we compare to the snapshot time of the previous period
                (SELECT COUNT(1) FROM ""Auctions"" WHERE EndTime > @PrevUtcNow AND EndTime <= (@PrevUtcNow + INTERVAL '24 hours')) AS EndingWithin24h,
                (SELECT COUNT(1) FROM ""Orders"" WHERE Status = 4 AND CreatedOnUtc >= @PrevStart AND CreatedOnUtc < @PrevEnd) AS CompletedOrders,
                (SELECT COUNT(1) FROM ""Disputes"" WHERE Status = 1 AND CreatedAtUtc >= @PrevStart AND CreatedAtUtc < @PrevEnd) AS OpenDisputes;
        ";

        using var connection = _sqlConnectionFactory.CreateConnection();

        // Calculate what "Now" was during the previous period for accurate historical snapshot comparison
        var periodDuration = currEnd - currStart;
        var prevUtcNow = utcNow - periodDuration;

        var parameters = new { CurrStart = currStart, CurrEnd = currEnd, PrevStart = prevStart, PrevEnd = prevEnd, UtcNow = utcNow, PrevUtcNow = prevUtcNow };

        using var multi = await connection.QueryMultipleAsync(new CommandDefinition(sql, parameters, cancellationToken: ct));

        var current = await multi.ReadSingleAsync<PeriodStats>();
        var previous = await multi.ReadSingleAsync<PeriodStats>();

        return (current, previous);
    }

 public async Task<AuctionActivityDataResult> GetActivityTrendsAsync(
        DateTime currStart, DateTime currEnd, 
        DateTime prevStart, DateTime prevEnd, 
        CancellationToken ct)
    {
        var sql = @"
            -- 1. Get the Overall Totals
            SELECT 
                (SELECT COUNT(1) FROM Auctions WHERE CreatedOnUtc >= @CurrStart AND CreatedOnUtc < @CurrEnd) AS CurrTotalAuctions,
                (SELECT COUNT(1) FROM Auctions WHERE CreatedOnUtc >= @PrevStart AND CreatedOnUtc < @PrevEnd) AS PrevTotalAuctions,
                
                (SELECT COUNT(1) FROM Bids WHERE PlacedAtUtc >= @CurrStart AND PlacedAtUtc < @CurrEnd) AS CurrTotalBids,
                (SELECT COUNT(1) FROM Bids WHERE PlacedAtUtc >= @PrevStart AND PlacedAtUtc < @PrevEnd) AS PrevTotalBids;

            -- 2. Get Daily Auctions for the current period
            SELECT 
                CAST(CreatedOnUtc AS DATE) AS DatePoint,
                COUNT(1) AS Count
            FROM Auctions
            WHERE CreatedOnUtc >= @CurrStart AND CreatedOnUtc < @CurrEnd
            GROUP BY CAST(CreatedOnUtc AS DATE)
            ORDER BY DatePoint ASC;

            -- 3. Get Daily Bids for the current period
            SELECT 
                CAST(PlacedAtUtc AS DATE) AS DatePoint,
                COUNT(1) AS Count
            FROM Bids
            WHERE PlacedAtUtc >= @CurrStart AND PlacedAtUtc < @CurrEnd
            GROUP BY CAST(PlacedAtUtc AS DATE)
            ORDER BY DatePoint ASC;
        ";

        using var connection = _sqlConnectionFactory.CreateConnection();
        
        var parameters = new 
        { 
            CurrStart = currStart, CurrEnd = currEnd,
            PrevStart = prevStart, PrevEnd = prevEnd 
        };
        
        using var multi = await connection.QueryMultipleAsync(new CommandDefinition(sql, parameters, cancellationToken: ct));
        
        var totals = await multi.ReadSingleAsync<RawActivityTotals>();
        var dailyAuctions = (await multi.ReadAsync<RawDailyActivity>()).ToList();
        var dailyBids = (await multi.ReadAsync<RawDailyActivity>()).ToList();

        return new AuctionActivityDataResult(totals, dailyAuctions.AsReadOnly(), dailyBids.AsReadOnly());
    }

   

}