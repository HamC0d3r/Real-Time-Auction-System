using Dapper;
using MazadZone.Application.Common.Interfaces;
using MazadZone.Application.Common.Paging;
using MazadZone.Application.Features.Orders.Queries.DTOs;
using MazadZone.Application.Features.Orders.Queries.GetBidderWonOrders;
using MazadZone.Application.Features.Orders.Queries.GetSellerOrderStatistics;
using MazadZone.Application.Services;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Orders;
using MazadZone.Domain.Users.ValueObjects;
using MzadZone.Domain.Payments;
using Polly;

namespace MazadZone.Infrastructure.Repositories;


public class OrderQueries : ResilientRepository, IOrderQueries
{

    public OrderQueries(ISqlConnectionFactory sqlFactory, IAsyncPolicy resiliencePolicy)
        : base(sqlFactory, resiliencePolicy) { }

    public async Task<OrderDetailsDto?> GetOrderDetailsAsync(OrderId orderId, CancellationToken ct = default)
    {
        const string sql = @"
        SELECT
           o.Id,
           o.TotalAmount,
           o.Currency,
           o.BidderId,
           o.WinningBidId,
           o.AuctionId,

           CASE o.Status
               WHEN 1 THEN 'Pending'
               WHEN 2 THEN 'Confirmed'
               WHEN 3 THEN 'Shipped'
               WHEN 4 THEN 'Delivered'
               WHEN 5 THEN 'Cancelled'
               ELSE 'Unknown'
           END AS Status,

           (CASE WHEN d.OrderId IS NOT NULL AND d.Status != @ResolvedDisputeStatus THEN true ELSE false END) AS HasActiveDispute,
           (CASE WHEN d.OrderId IS NULL AND o.Status IN (@ShippedStatus, @DeliveredStatus) THEN true ELSE false END) AS IsDisputable,
           (CASE WHEN f.OrderId IS NULL AND o.Status = @DeliveredStatus THEN true ELSE false END) AS CanLeaveFeedback,
           
           COALESCE(p.GrossAmount, 0) AS GrossAmount,
           COALESCE(p.PlatformFee, 0) AS PlatformFee,
           COALESCE(p.NetAmount, 0) AS NetAmount

        FROM ""Orders"" o
        LEFT JOIN ""Disputes"" d ON o.Id = d.OrderId
        LEFT JOIN ""Feedbacks"" f ON o.Id = f.OrderId
        LEFT JOIN ""Payments"" p ON o.Id = p.OrderId
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



    public async Task<SellerOrderStatsDto> GetSellerStatsAsync(UserId sellerId, CancellationToken ct = default)
    {
        // 1. We use aggregate functions directly in SQL. 
        // 2. We use conditional aggregation (COUNT(CASE WHEN...)) to pivot rows into columns.
        const string sql = @"
            SELECT  
                COALESCE(SUM(o.TotalAmount),0) AS TotalSales,
                COALESCE(SUM(CASE WHEN o.Status IN (@DeliveredStatus) THEN o.TotalAmount END), 0) AS TotalRevenue,
                COUNT(CASE WHEN o.Status = @PendingStatus THEN 1 END) AS PendingOrders,
                COUNT(CASE WHEN o.DisputeId IS NOT NULL AND d.Status != @ResolvedDisputeStatus THEN 1 END) AS ActiveDisputes,
                COALESCE(AVG(CASE WHEN f.Rating IS NOT NULL THEN f.Rating END), 0) AS AverageRating
            FROM ""Orders"" o
            INNER JOIN ""Bids"" b ON o.WinningBidId = b.Id
            INNER JOIN ""Auctions"" a ON b.AuctionId = a.Id
            LEFT JOIN ""Disputes"" d ON o.DisputeId = d.Id
            LEFT JOIN ""Feedbacks"" f ON o.FeedbackId = f.Id
            WHERE a.SellerId = @SellerId";

        var stats = await ExecuteResilientAsync(connection =>
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

           (CASE WHEN o.DisputeId IS NOT NULL AND d.Status != @ResolvedDisputeStatus THEN true ELSE false END) AS HasActiveDispute,
           (CASE WHEN o.DisputeId IS NULL AND o.Status IN (@ShippedStatus, @DeliveredStatus) THEN true ELSE false END) AS IsDisputable,
           (CASE WHEN o.FeedbackId IS NULL AND o.Status = @DeliveredStatus THEN true ELSE false END) AS CanLeaveFeedback,
           
           COALESCE(p.GrossAmount, 0) AS GrossAmount,
           COALESCE(p.PlatformFee, 0) AS PlatformFee,
           COALESCE(p.NetAmount, 0) AS NetAmount

        FROM ""Orders"" o
        LEFT JOIN ""Disputes"" d ON o.DisputeId = d.Id
        LEFT JOIN ""Feedbacks"" f ON o.FeedbackId = f.Id
        LEFT JOIN ""Payments"" p ON o.Id = p.OrderId
        WHERE o.WinningBidId = @WinningBidId";

        return await ExecuteResilientAsync(connection => connection.QueryFirstOrDefaultAsync<OrderDetailsDto>(sql, new
        {
            WinningBidId = winningBidId.Value,
            ResolvedDisputeStatus = (int)DisputeStatus.Resolved,
            ShippedStatus = (int)OrderStatus.Shipped,
            DeliveredStatus = (int)OrderStatus.Delivered
        }, commandType: System.Data.CommandType.Text));
    }

    public Task<Payment?> GetPaymentByOrderIdAsync(OrderId orderId, CancellationToken ct = default)
    {
        throw new NotImplementedException();
    }

    public Task<AuctionId> GetAuctionIdByOrderIdAsync(OrderId orderId, CancellationToken ct = default)
    {
        throw new NotImplementedException();
    }

    public Task<OrderStatisticsDto> GetSellerOrderStatisticsAsync(UserId sellerId, CancellationToken ct)
    {
        var sql = @"
            SELECT 
                COUNT(o.Id) AS TotalOrders,
                SUM(CASE WHEN o.Status = @PendingStatus THEN 1 ELSE 0 END) AS PendingCount,
                SUM(CASE WHEN o.Status = @ConfirmedStatus THEN 1 ELSE 0 END) AS ConfirmedCount,
                SUM(CASE WHEN o.Status = @ShippedStatus THEN 1 ELSE 0 END) AS ShippedCount,
                SUM(CASE WHEN o.Status = @DeliveredStatus THEN 1 ELSE 0 END) AS DeliveredCount,
                SUM(CASE WHEN o.Status = @CanceledStatus THEN 1 ELSE 0 END) AS CanceledCount
            FROM ""Orders"" o
            INNER JOIN ""Auctions"" a ON o.AuctionId = a.Id
            WHERE a.SellerId = @SellerId;
        ";


        var parameters = new
        {
            SellerId = sellerId.Value,
            PendingStatus = (int)OrderStatus.Pending,
            ConfirmedStatus = (int)OrderStatus.Confirmed,
            ShippedStatus = (int)OrderStatus.Shipped,
            DeliveredStatus = (int)OrderStatus.Delivered,
            CanceledStatus = (int)OrderStatus.Canceled
        };

        return ExecuteResilientAsync(async connection =>
        {
            var result = await connection.QueryFirstOrDefaultAsync<OrderStatisticsDto>(
            new CommandDefinition(sql, parameters, cancellationToken: ct));

            return result ?? new OrderStatisticsDto(0, 0, 0, 0, 0, 0);
        });

    }

    public async Task<PagedList<OrderSummaryDto>> GetSellerOrdersTableAsync(
            UserId sellerId,
            OrderStatus? statusFilter,
            int page,
            int pageSize,
            CancellationToken ct)
    {
        // 1. Base WHERE clause
        var whereClause = "WHERE a.SellerId = @SellerId";
        if (statusFilter.HasValue)
        {
            whereClause += " AND o.Status = @Status";
        }

        // 2. Build the multi-query
        var sql = $@"
            -- Query 1: Get Total Count for Pagination
            SELECT COUNT(o.Id)
            FROM ""Orders"" o
            INNER JOIN ""Auctions"" a ON o.AuctionId = a.Id
            {whereClause};

            -- Query 2: Get the actual page of data
            SELECT 
                o.Id AS OrderId,
                i.Title AS AuctionName,
                c.Name AS CategoryName,
                CONCAT(u.FirstName, ' ', u.LastName) AS BidderName,
                u.Email AS BidderEmail,
                CASE o.Status
                    WHEN @StatusPending THEN 'Pending'
                    WHEN @StatusConfirmed THEN 'Confirmed'
                    WHEN @StatusShipped THEN 'Shipped'
                    WHEN @StatusDelivered THEN 'Delivered'
                    WHEN @StatusCanceled THEN 'Canceled'
                ELSE 'Unknown'
                END AS Status,
                o.CreatedOnUtc AS OrderDate,
                o.TotalAmount,
                o.Currency
            FROM ""Orders"" o
            INNER JOIN ""Auctions"" a ON o.AuctionId = a.Id
            INNER JOIN ""Items"" i ON a.Id = i.AuctionId
            INNER JOIN ""Categories"" c ON i.CategoryId = c.Id
            INNER JOIN ""Users"" u ON o.BidderId = u.Id
            {whereClause}
            ORDER BY o.CreatedOnUtc DESC
            LIMIT @PageSize OFFSET @Offset;
        ";


        var parameters = new
        {
            SellerId = sellerId.Value,
            Status = statusFilter.HasValue ? (int)statusFilter.Value : (int?)null,
            Offset = (page - 1) * pageSize,
            PageSize = pageSize,
            StatusPending = (int)OrderStatus.Pending,
            StatusConfirmed = (int)OrderStatus.Confirmed,
            StatusShipped = (int)OrderStatus.Shipped,
            StatusDelivered = (int)OrderStatus.Delivered,
            StatusCanceled = (int)OrderStatus.Canceled
        };

        return await ExecuteResilientAsync(async connection =>
        {
            var multi = await connection.QueryMultipleAsync(
            new CommandDefinition(sql, parameters, cancellationToken: ct));

            var totalCount = await multi.ReadSingleAsync<int>();
            var items = (await multi.ReadAsync<OrderSummaryDto>()).ToList();

            // 3. Map directly to your custom PagedList
            return new PagedList<OrderSummaryDto>(
                items.AsReadOnly(),
                page,
                pageSize,
                totalCount
            );
        });

    }

    public async Task<PagedList<WonOrderSummaryDto>> GetBidderWonOrdersAsync(
        UserId bidderId,
        OrderStatus? statusFilter,
        int page,
        int pageSize,
        CancellationToken ct)
    {
        // 1. Base WHERE clause for the Buyer
        var whereClause = "WHERE o.BidderId = @BidderId";
        if (statusFilter.HasValue)
        {
            whereClause += " AND o.Status = @FilterStatus";
        }

        // 2. Build the multi-query
        var sql = $@"
        -- Query 1: Get Total Count for Pagination
        SELECT COUNT(o.Id)
        FROM ""Orders"" o
        {whereClause};

        -- Query 2: Get the actual page of data
        SELECT 
            o.Id AS OrderId,
            i.Title AS ItemTitle,
            o.TotalAmount AS FinalBidAmount,
            o.CreatedOnUtc AS OrderDate,
            a.SellerId AS SellerId,
            CONCAT(u.FirstName, ' ', u.LastName) AS SellerName,
            CASE o.Status
                WHEN @StatusPending THEN 'Pending'
                WHEN @StatusConfirmed THEN 'Processing' -- Mapped to match your UI badge
                WHEN @StatusShipped THEN 'Shipped'
                WHEN @StatusDelivered THEN 'Delivered'
                WHEN @StatusCanceled THEN 'Cancelled'
                ELSE 'Unknown'
            END AS Status
        FROM ""Orders"" o
        INNER JOIN ""Auctions"" a ON o.AuctionId = a.Id
        INNER JOIN ""Items"" i ON a.Id = i.AuctionId
        INNER JOIN ""Users"" u ON a.SellerId = u.Id -- Joining to get the SELLER'S name
        {whereClause}
        ORDER BY o.CreatedOnUtc DESC
        LIMIT @PageSize OFFSET @Offset;
    ";

        var parameters = new
        {
            BidderId = bidderId.Value,
            FilterStatus = statusFilter.HasValue ? (int)statusFilter.Value : (int?)null,
            Offset = (page - 1) * pageSize,
            PageSize = pageSize,

            // Variables for the CASE statement mapping
            StatusPending = (int)OrderStatus.Pending,
            StatusConfirmed = (int)OrderStatus.Confirmed,
            StatusShipped = (int)OrderStatus.Shipped,
            StatusDelivered = (int)OrderStatus.Delivered,
            StatusCanceled = (int)OrderStatus.Canceled
        };

        return await ExecuteResilientAsync(async connection =>
        {
            var multi = await connection.QueryMultipleAsync(
                new CommandDefinition(sql, parameters, cancellationToken: ct)
            );

            var totalCount = await multi.ReadSingleAsync<int>();
            var items = (await multi.ReadAsync<WonOrderSummaryDto>()).ToList();

            return new PagedList<WonOrderSummaryDto>(
                items.AsReadOnly(),
                page,
                pageSize,
                totalCount
            );
        });
    }

}