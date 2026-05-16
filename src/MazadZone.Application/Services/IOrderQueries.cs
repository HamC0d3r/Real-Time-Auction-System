using MazadZone.Application.Common.Paging;
using MazadZone.Application.Features.Orders.Queries.DTOs;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Shared.Interfaces;
using MzadZone.Domain.Payments;

namespace MazadZone.Application.Services;

public interface IOrderQueries : IScopedService
{
    // --- Detailed View ---
    Task<OrderDetailsDto?> GetOrderDetailsAsync(OrderId orderId, CancellationToken ct = default);
    
    // --- List & Search (Refactored GetOrderHistory) ---
    Task<PagedList<OrderSummaryDto>> SearchOrdersAsync(OrderSearchFilter filter, CancellationToken ct = default);

    // --- Specialized Lookups ---
    Task<OrderDetailsDto?> GetOrderByWinningBidAsync(BidId winningBidId, CancellationToken ct = default);

    // --- Analytics & Dashboard ---
    Task<SellerOrderStatsDto> GetSellerStatsAsync(SellerId sellerId, CancellationToken ct = default);
    Task<AdminGlobalStatsDto> GetGlobalStatsAsync(CancellationToken ct = default);

    // --- Payment Queries ---
    Task<Payment?> GetPaymentByOrderIdAsync(OrderId orderId, CancellationToken ct = default);

    Task<AuctionId> GetAuctionIdByOrderIdAsync(OrderId orderId, CancellationToken ct = default);
}