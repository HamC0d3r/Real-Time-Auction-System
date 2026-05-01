using MazadZone.Application.Common.Paging;
using MazadZone.Application.Features.Orders.Queries.DTOs;
using MazadZone.Domain.Auctions;

namespace MazadZone.Application.Services;
public interface IOrderQueries
{
    // --- Detailed View ---
    Task<OrderDetailsDto?> GetOrderDetailsAsync(OrderId orderId, CancellationToken ct = default);
    
    // --- List & Search (Refactored GetOrderHistory) ---
    Task<PagedList<OrderSummaryDto>> SearchOrdersAsync(OrderSearchFilter filter, CancellationToken ct = default);

    // --- Specialized Lookups ---
    Task<OrderDetailsDto?> GetOrderByWinningBidAsync(BidId winningBidId, CancellationToken ct = default);

    // --- Analytics & Dashboard (The "Architect" Level) ---
    Task<SellerOrderStatsDto> GetSellerStatsAsync(SellerId sellerId, CancellationToken ct = default);
    Task<AdminGlobalStatsDto> GetGlobalStatsAsync(CancellationToken ct = default);
}