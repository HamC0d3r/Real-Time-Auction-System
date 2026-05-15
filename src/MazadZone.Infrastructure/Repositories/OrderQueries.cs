using Dapper;
using MazadZone.Application.Common.Interfaces;
using MazadZone.Application.Common.Paging;
using MazadZone.Application.Features.Orders.Queries.DTOs;
using MazadZone.Application.Services;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Orders;
using MzadZone.Domain.Payments;
using Polly;

namespace MazadZone.Infrastructure.Repositories;

public class OrderQueries : ResilientRepository , IOrderQueries
{

    public OrderQueries(ISqlConnectionFactory sqlFactory, IAsyncPolicy resiliencePolicy) 
        : base(sqlFactory, resiliencePolicy) {}

    public async Task<OrderDetailsDto?> GetOrderDetailsAsync(OrderId orderId, CancellationToken ct = default)
    {
        const string sql = @"
        SELECT
           o.Id,
           o.TotalAmount,
           o.Currency,
           o.BidderId,
           o.WinningBidId,

           CASE o.Status
               WHEN 1 THEN 'Pending'
               WHEN 2 THEN 'Confirmed'
               WHEN 3 THEN 'Shipped'
               WHEN 4 THEN 'Delivered'
               WHEN 5 THEN 'Cancelled'
               ELSE 'Unknown'
           END AS Status,

          CAST(CASE WHEN o.DisputeId IS NOT NULL AND d.Status != @ResolvedDisputeStatus THEN 1 ELSE 0 END AS BIT) AS HasActiveDispute,
           CAST(CASE WHEN o.DisputeId IS NULL AND o.Status IN (@ShippedStatus, @DeliveredStatus) THEN 1 ELSE 0 END AS BIT) AS IsDisputable,
           CAST(CASE WHEN o.FeedbackId IS NULL AND o.Status = @DeliveredStatus THEN 1 ELSE 0 END AS BIT) AS CanLeaveFeedback

        FROM Orders o
        LEFT JOIN Disputes d ON o.DisputeId = d.Id
        LEFT JOIN Feedbacks f ON o.FeedbackId = f.Id
        WHERE o.Id = @OrderId";

       return await ExecuteResilientAsync(connection => 
        connection.QueryFirstOrDefaultAsync<OrderDetailsDto>(sql, new
        {
            OrderId = orderId.Value,
            ResolvedDisputeStatus = (int)DisputeStatus.Resolved,
            ShippedStatus = (int)OrderStatus.Shipped,
            DeliveredStatus = (int)OrderStatus.Delivered
        }, 
        commandType: System.Data.CommandType.Text)
    );
    }

    public async Task<PagedList<OrderSummaryDto>> SearchOrdersAsync(OrderSearchFilter filter, CancellationToken ct = default)
    {
        var whereConditions = new List<string>() { "1=1" }; // Start with a no-op condition for easier concatenation
        var parameters = new DynamicParameters();

        if (filter.UserId.HasValue)
        {
            whereConditions.Add("BidderId = @UserId");
            parameters.Add("UserId", filter.UserId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            whereConditions.Add("lower(Status) = @Status");
            parameters.Add("Status", filter.Status.ToLower());
        }

        string whereClause = string.Join(" AND ", whereConditions);

        string sql = $@"
        SELECT COUNT(1) FROM Orders WHERE {whereClause};

        SELECT
            Id,
            TotalAmount,
            Currency,
            CASE o.Status
               WHEN 1 THEN 'Pending'
               WHEN 2 THEN 'Confirmed'
               WHEN 3 THEN 'Shipped'
               WHEN 4 THEN 'Delivered'
               WHEN 5 THEN 'Cancelled'
               ELSE 'Unknown'
           END AS Status,

            CAST(CASE WHEN DisputeId IS NULL AND Status IN (@Shipped, @Delivered) THEN 1 ELSE 0 END AS BIT) AS IsDisputable,
            CAST(CASE WHEN DisputeId IS NOT NULL THEN 1 ELSE 0 END AS BIT) AS HasActiveDispute,
            CAST(CASE WHEN Status = @Delivered AND FeedbackId IS NULL THEN 1 ELSE 0 END AS BIT) AS CanLeaveFeedback
        FROM Orders
            WHERE {whereClause}
            ORDER BY Id DESC
            OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;

        ";

        parameters.Add("Offset", (filter.PageNumber - 1) * filter.PageSize);
        parameters.Add("PageSize", filter.PageSize);
        parameters.Add("Shipped", (int)OrderStatus.Shipped);
        parameters.Add("Delivered", (int)OrderStatus.Delivered);

        return await ExecuteResilientAsync(async connection =>
        {
            using var multi = await connection.QueryMultipleAsync(sql, parameters);

            var totalCount = await multi.ReadFirstAsync<int>();
            var items = (await multi.ReadAsync<OrderSummaryDto>()).ToList();

            return new PagedList<OrderSummaryDto>(items, totalCount, filter.PageNumber, filter.PageSize);
        });
    }

    public async Task<SellerOrderStatsDto> GetSellerStatsAsync(SellerId sellerId, CancellationToken ct = default)
    {
        // 1. We use aggregate functions directly in SQL. 
        // 2. We use conditional aggregation (COUNT(CASE WHEN...)) to pivot rows into columns.
        const string sql = @"o
            SELECT  
                ISNULL(SUM(o.TotalAmount),0) AS TotalSales,
                ISNULL(SUM(CASE WHEN o.Status IN (@DeliveredStatus) THEN o.TotalAmount END), 0) AS TotalRevenue,
                COUNT(CASE WHEN o.Status = @PendingStatus THEN 1 END) AS PendingOrders,
                COUNT(CASE WHEN o.DisputeId IS NOT NULL AND d.Status != @ResolvedDisputeStatus THEN 1 END) AS ActiveDisputes,
                ISNULL(AVG(CASE WHEN f.Rating IS NOT NULL THEN f.Rating END), 0) AS AverageRating
            FROM Orders o
            INNER JOIN Bids b ON o.WinningBidId = b.Id
            INNER JOIN Auctions a ON b.AuctionId = a.Id
            LEFT JOIN Disputes d ON o.DisputeId = d.Id
            LEFT JOIN Feedbacks f ON o.FeedbackId = f.Id
            WHERE a.SellerId = @SellerId";

        var stats = await ExecuteResilientAsync( connection =>
             connection.QuerySingleOrDefaultAsync<SellerOrderStatsDto>(sql, new
            {
                SellerId = sellerId.Value,
                PendingStatus = (int)OrderStatus.Pending,
                ResolvedDispute = (int)DisputeStatus.Resolved
            })
        );

        return stats ?? SellerOrderStatsDto.Empty;
    }

    public async Task<OrderDetailsDto?> GetOrderByWinningBidAsync(BidId winningBidId, CancellationToken ct = default)
    {
        const string sql = @"
        SELECT
           o.Id,
           o.TotalAmount,
           o.Currency,
           o.BidderId,
           o.WinningBidId,

           CASE o.Status
               WHEN 1 THEN 'Pending'
               WHEN 2 THEN 'Confirmed'
               WHEN 3 THEN 'Shipped'
               WHEN 4 THEN 'Delivered'
               WHEN 5 THEN 'Cancelled'
               ELSE 'Unknown'
           END AS Status,

          CAST(CASE WHEN o.DisputeId IS NOT NULL AND d.Status != @ResolvedDisputeStatus THEN 1 ELSE 0 END AS BIT) AS HasActiveDispute,
           CAST(CASE WHEN o.DisputeId IS NULL AND o.Status IN (@ShippedStatus, @DeliveredStatus) THEN 1 ELSE 0 END AS BIT) AS IsDisputable,
           CAST(CASE WHEN o.FeedbackId IS NULL AND o.Status = @DeliveredStatus THEN 1 ELSE 0 END AS BIT) AS CanLeaveFeedback

        FROM Orders o
        LEFT JOIN Disputes d ON o.DisputeId = d.Id
        LEFT JOIN Feedbacks f ON o.FeedbackId = f.Id
        WHERE o.WinningBidId = @WinningBidId";

        return await ExecuteResilientAsync(connection => connection.QueryFirstOrDefaultAsync<OrderDetailsDto>(sql, new
        {
            WinningBidId = winningBidId.Value,
            ResolvedDisputeStatus = (int)DisputeStatus.Resolved,
            ShippedStatus = (int)OrderStatus.Shipped,
            DeliveredStatus = (int)OrderStatus.Delivered
        }, commandType: System.Data.CommandType.Text));
    }

    public async Task<AdminGlobalStatsDto> GetGlobalStatsAsync(CancellationToken ct = default)
    {
        const string sql = @"
        SELECT 
            -- 1. Gross Volume (Everything)
            ISNULL(SUM(o.TotalAmount_Amount), 0) AS TotalSalesVolume,
            COUNT(o.Id) AS TotalOrders,

            -- 2. Realized Revenue (Only successfully delivered)
            ISNULL(SUM(CASE WHEN o.Status = @Delivered THEN o.TotalAmount_Amount ELSE 0 END), 0) AS TotalRealizedRevenue,
            
            -- Average Order Value (Usually best to only average completed orders)
            ISNULL(AVG(CASE WHEN o.Status = @Delivered THEN o.TotalAmount_Amount ELSE NULL END), 0) AS AverageOrderValue,

            -- 3. Pending Pipeline (Money tied up in processing)
            ISNULL(SUM(CASE WHEN o.Status = @Pending THEN o.TotalAmount_Amount ELSE 0 END), 0) AS TotalPendingAmount,
            COUNT(CASE WHEN o.Status = @Pending THEN 1 END) AS TotalPendingOrders,

            -- 4. Lost / Canceled Revenue
            ISNULL(SUM(CASE WHEN o.Status = @Canceled THEN o.TotalAmount_Amount ELSE 0 END), 0) AS TotalCanceledAmount,
            COUNT(CASE WHEN o.Status = @Canceled THEN 1 END) AS TotalCanceledOrders,

            -- 5. Operations
            COUNT(CASE WHEN o.DisputeId IS NOT NULL AND d.Status != @Resolved THEN 1 END) AS TotalActiveDisputes
            
        FROM Orders o
        LEFT JOIN Disputes d ON o.DisputeId = d.Id";

        // Pass the required enum states as parameters

        var stats = await ExecuteResilientAsync(connection =>
         connection.QuerySingleOrDefaultAsync<AdminGlobalStatsDto>(sql, new
         {
             Resolved = (int)DisputeStatus.Resolved,
             Pending = (int)OrderStatus.Pending,
             Delivered = (int)OrderStatus.Delivered,
             Canceled = (int)OrderStatus.Canceled
         }));

        // Provide a safe fallback if the table is completely empty
        return stats ?? AdminGlobalStatsDto.Empty;
    }

    public Task<Payment?> GetPaymentByOrderIdAsync(OrderId orderId, CancellationToken ct = default)
    {
        throw new NotImplementedException();
    }

    public Task<AuctionId> GetAuctionIdByOrderIdAsync(OrderId orderId, CancellationToken ct = default)
    {
        throw new NotImplementedException();
    }
}