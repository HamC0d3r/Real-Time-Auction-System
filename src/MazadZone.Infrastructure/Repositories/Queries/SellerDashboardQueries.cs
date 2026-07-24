using Dapper;
using MazadZone.Application.Common.Interfaces;
using MazadZone.Application.Features.SellerDashboard.DTOs;
using MazadZone.Application.Features.SellerDashboard.Queries;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Orders;
using MazadZone.Domain.Users.ValueObjects;
using Polly;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Text;

namespace MazadZone.Infrastructure.Repositories.Queries;

public class SellerDashboardQueries : ResilientRepository, ISellerDashboardQueries
{
    public SellerDashboardQueries(ISqlConnectionFactory sqlFactory, IAsyncPolicy resiliencePolicy) : base(sqlFactory, resiliencePolicy) { }

    public async Task<SellerAuctionsResponse?> GetSellerAuctionsAsync(UserId sellerId, SellerDashboardFilter filter, CancellationToken cancellationToken)
    {
        using var connection = _connectionFactory.CreateConnection();

        // Stats
        const string activeSql = @"SELECT COUNT(1) FROM ""Auctions"" WHERE SellerId = @SellerId AND Status = @ActiveStatus";
        const string pendingSql = @"SELECT COUNT(1) FROM ""Auctions"" WHERE SellerId = @SellerId AND Status = @PendingStatus";
        const string soldSql = @"SELECT COUNT(1) FROM ""Auctions"" a WHERE a.SellerId = @SellerId AND a.Status = @EndedStatus AND EXISTS (SELECT 1 FROM ""Bids"" b WHERE b.AuctionId = a.Id)";
        const string unsoldSql = @"SELECT COUNT(1) FROM ""Auctions"" a WHERE a.SellerId = @SellerId AND a.Status = @EndedStatus AND NOT EXISTS (SELECT 1 FROM ""Bids"" b WHERE b.AuctionId = a.Id)";

        var active = await connection.ExecuteScalarAsync<int>(new CommandDefinition(activeSql, new { SellerId = sellerId.Value, ActiveStatus = (int)AuctionStatus.Active }, cancellationToken: cancellationToken));
        var pending = await connection.ExecuteScalarAsync<int>(new CommandDefinition(pendingSql, new { SellerId = sellerId.Value, PendingStatus = (int)AuctionStatus.Pending }, cancellationToken: cancellationToken));
        var sold = await connection.ExecuteScalarAsync<int>(new CommandDefinition(soldSql, new { SellerId = sellerId.Value, EndedStatus = (int)AuctionStatus.Ended }, cancellationToken: cancellationToken));
        var unsold = await connection.ExecuteScalarAsync<int>(new CommandDefinition(unsoldSql, new { SellerId = sellerId.Value, EndedStatus = (int)AuctionStatus.Ended }, cancellationToken: cancellationToken));

        var page = filter?.Page > 0 ? filter.Page : 1;
        var pageSize = filter?.PageSize > 0 ? filter.PageSize : 20;
        var offset = (page - 1) * pageSize;

        var whereClause = new StringBuilder("WHERE a.SellerId = @SellerId");
        
        int? statusValue = null;
        if (!string.IsNullOrWhiteSpace(filter?.Status))
        {
            if (filter.Status.Equals("Sold", StringComparison.OrdinalIgnoreCase))
            {
                whereClause.Append($" AND a.Status = {(int)AuctionStatus.Ended} AND EXISTS (SELECT 1 FROM Bids bs WHERE bs.AuctionId = a.Id)");
            }
            else if (filter.Status.Equals("Unsold", StringComparison.OrdinalIgnoreCase))
            {
                whereClause.Append($" AND a.Status = {(int)AuctionStatus.Ended} AND NOT EXISTS (SELECT 1 FROM Bids bs WHERE bs.AuctionId = a.Id)");
            }
            else if (Enum.TryParse<AuctionStatus>(filter.Status, true, out var s))
            {
                statusValue = (int)s;
                whereClause.Append(" AND a.Status = @Status");
            }
        }

        if (!string.IsNullOrWhiteSpace(filter?.SearchTerm))
        {
            whereClause.Append(" AND it.Title ILIKE @SearchTerm");
        }

        if (filter?.DateFrom.HasValue == true)
        {
            whereClause.Append(" AND a.EndTime >= @DateFrom");
        }
        
        if (filter?.DateTo.HasValue == true)
        {
            whereClause.Append(" AND a.EndTime <= @DateTo");
        }

        var countSql = $@"SELECT COUNT(1) FROM ""Auctions"" a INNER JOIN ""Items"" it ON it.AuctionId = a.Id {whereClause}";
        
        string orderBy = filter?.SortBy?.ToLower() switch
        {
            "price" => "LastBidAmount",
            "bids" => "BidsCount",
            "date" => "a.EndTime",
            "creationdate" => "a.CreatedOnUtc",
            _ => "a.CreatedOnUtc"
        };
        string dir = filter?.SortDirection?.ToUpper() == "ASC" ? "ASC" : "DESC";

        var listSql = $"SELECT a.Id AS AuctionId, it.Title, c.Name AS Category, " +
                      "CASE " +
                      $"  WHEN a.Status = {(int)AuctionStatus.Pending} THEN 'Pending' " +
                      $"  WHEN a.Status = {(int)AuctionStatus.Active} THEN 'Active' " +
                      $"  WHEN a.Status = {(int)AuctionStatus.Ended} AND EXISTS (SELECT 1 FROM \"\"Bids\"\" b2 WHERE b2.AuctionId = a.Id) THEN 'Sold' " +
                      $"  WHEN a.Status = {(int)AuctionStatus.Ended} THEN 'Unsold' " +
                      $"  WHEN a.Status = {(int)AuctionStatus.Cancelled} THEN 'Cancelled' " +
                      "  ELSE 'Unknown' " +
                      "END AS Status, " +
                      "(SELECT COUNT(1) FROM \"\"Bids\"\" b WHERE b.AuctionId = a.Id) AS BidsCount, " +
                      "COALESCE((SELECT b.Amount FROM \"\"Bids\"\" b WHERE b.AuctionId = a.Id ORDER BY b.PlacedAtUtc DESC LIMIT 1), a.StartBidAmount) AS LastBidAmount, " +
                      "a.EndTime AS EndDateUtc, " +
                      "(SELECT img.ImageUrl FROM \"\"ItemImages\"\" img WHERE img.ItemId = it.Id AND img.isMain = true LIMIT 1) AS ThumbnailUrl " +
                      "FROM \"\"Auctions\"\" a " +
                      "INNER JOIN \"\"Items\"\" it ON it.AuctionId = a.Id " +
                      "LEFT JOIN \"\"Categories\"\" c ON c.Id = it.CategoryId " +
                      whereClause +
                      $" ORDER BY {orderBy} {dir} " +
                      " LIMIT @PageSize OFFSET @Offset";

        var parameters = new 
        { 
            SellerId = sellerId.Value, 
            Status = statusValue != null ? (object)statusValue : null, 
            SearchTerm = $"%{filter?.SearchTerm}%",
            DateFrom = filter?.DateFrom,
            DateTo = filter?.DateTo,
            Offset = offset, 
            PageSize = pageSize 
        };

        var totalCount = await connection.ExecuteScalarAsync<int>(new CommandDefinition(countSql, parameters, cancellationToken: cancellationToken));
        var auctions = await connection.QueryAsync<SellerAuctionSummaryDto>(new CommandDefinition(listSql, parameters, cancellationToken: cancellationToken));

        return new SellerAuctionsResponse
        {
            ActiveAuctions = active,
            Pending = pending,
            SoldItems = sold,
            Unsold = unsold,
            TotalCount = totalCount,
            Auctions = auctions.AsList()
        };
    }

    public async Task<SellerOrdersResponse?> GetSellerOrdersAsync(UserId sellerId, SellerDashboardFilter filter, CancellationToken cancellationToken)
    {
        using var connection = _connectionFactory.CreateConnection();

        var page = filter?.Page > 0 ? filter.Page : 1;
        var pageSize = filter?.PageSize > 0 ? filter.PageSize : 20;
        var offset = (page - 1) * pageSize;

        var whereClause = new StringBuilder("WHERE a.SellerId = @SellerId");

        if (!string.IsNullOrWhiteSpace(filter?.Status) && Enum.TryParse<OrderStatus>(filter.Status, true, out var s))
        {
            whereClause.Append(" AND o.Status = @Status");
        }

        if (!string.IsNullOrWhiteSpace(filter?.SearchTerm))
        {
            whereClause.Append(" AND it.Title ILIKE @SearchTerm");
        }

        if (filter?.DateFrom.HasValue == true)
        {
            whereClause.Append(" AND o.CreatedOnUtc >= @DateFrom");
        }
        
        if (filter?.DateTo.HasValue == true)
        {
            whereClause.Append(" AND o.CreatedOnUtc <= @DateTo");
        }

        var countSql = $@"SELECT COUNT(1) FROM ""Orders"" o INNER JOIN ""Auctions"" a ON o.AuctionId = a.Id INNER JOIN ""Items"" it ON it.AuctionId = a.Id {whereClause}";

        string orderBy = filter?.SortBy?.ToLower() switch
        {
            "amount" => "o.TotalAmount",
            "date" => "o.CreatedOnUtc",
            _ => "o.CreatedOnUtc"
        };
        string dir = filter?.SortDirection?.ToUpper() == "ASC" ? "ASC" : "DESC";

        var listSql = $@"
            SELECT 
                o.Id AS OrderId, 
                a.Id AS AuctionId, 
                it.Title AS AuctionTitle, 
                CASE o.Status
                    WHEN 1 THEN 'Pending'
                    WHEN 2 THEN 'Confirmed'
                    WHEN 3 THEN 'Shipped'
                    WHEN 4 THEN 'Delivered'
                    WHEN 5 THEN 'Canceled'
                    ELSE 'Unknown'
                END AS OrderStatus, 
                o.CreatedOnUtc AS OrderDateUtc, 
                o.TotalAmount, 
                CONCAT(u.FirstName, ' ', u.LastName) AS BidderName 
            FROM ""Orders"" o 
            INNER JOIN ""Auctions"" a ON o.AuctionId = a.Id 
            INNER JOIN ""Items"" it ON it.AuctionId = a.Id 
            INNER JOIN ""Users"" u ON o.BidderId = u.Id 
            {whereClause} 
            ORDER BY {orderBy} {dir} 
            LIMIT @PageSize OFFSET @Offset";

        var parameters = new 
        { 
            SellerId = sellerId.Value, 
            Status = filter?.Status != null ? (object)filter.Status : null, 
            SearchTerm = $"%{filter?.SearchTerm}%",
            DateFrom = filter?.DateFrom,
            DateTo = filter?.DateTo,
            Offset = offset, 
            PageSize = pageSize 
        };

        var totalCount = await connection.ExecuteScalarAsync<int>(new CommandDefinition(countSql, parameters, cancellationToken: cancellationToken));
        var orders = await connection.QueryAsync<SellerOrderSummaryDto>(new CommandDefinition(listSql, parameters, cancellationToken: cancellationToken));

        return new SellerOrdersResponse
        {
            TotalCount = totalCount,
            Orders = orders.AsList()
        };
    }

    public async Task<SellerFinancialsResponse?> GetSellerFinancialsAsync(UserId sellerId, SellerDashboardFilter filter, CancellationToken cancellationToken)
    {
        using var connection = _connectionFactory.CreateConnection();
        
        var whereClause = new StringBuilder("WHERE a.SellerId = @SellerId AND p.Status = 1"); // 1 is PaymentStatus.Captured

        if (filter?.DateFrom.HasValue == true)
        {
            whereClause.Append(" AND o.CreatedOnUtc >= @DateFrom");
        }
        
        if (filter?.DateTo.HasValue == true)
        {
            whereClause.Append(" AND o.CreatedOnUtc <= @DateTo");
        }

        var sql = $@"
            SELECT 
                COALESCE(SUM(p.GrossAmount), 0) AS TotalGrossRevenue,
                COALESCE(SUM(p.PlatformFee), 0) AS TotalPlatformFees,
                COALESCE(SUM(p.NetAmount), 0) AS TotalNetProfit,
                COUNT(o.Id) AS CompletedOrdersCount
            FROM ""Payments"" p
            INNER JOIN ""Orders"" o ON p.OrderId = o.Id
            INNER JOIN ""Auctions"" a ON o.AuctionId = a.Id
            {whereClause}
        ";

        var parameters = new 
        { 
            SellerId = sellerId.Value, 
            DateFrom = filter?.DateFrom,
            DateTo = filter?.DateTo
        };

        var result = await connection.QuerySingleOrDefaultAsync<SellerFinancialsResponse>(new CommandDefinition(sql, parameters, cancellationToken: cancellationToken));
        
        return result ?? new SellerFinancialsResponse();
    }
}
