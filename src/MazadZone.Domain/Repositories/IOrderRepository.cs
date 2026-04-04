using MazadZone.Domain.Auctions;

namespace MazadZone.Domain.Entities.Orders;

public interface IOrderRepository
{
    // Core Domain write-model operations
    Task<Order?> GetByIdAsync(OrderId id, CancellationToken cancellationToken = default);
    Task AddAsync(Order order, CancellationToken cancellationToken = default);

    // CQRS Read-model analytical extensions
    Task<decimal> GetTotalSalesBySellerAsync(SellerId sellerId, CancellationToken cancellationToken = default);
    Task<int> GetPendingOrdersCountAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<OrderHistoryDto>> GetOrderHistoryAsync(UserId userId, int page, int pageSize, CancellationToken cancellationToken = default);
    Task<OrderDetailsDto?> GetOrderDetailsAsync(OrderId orderId, CancellationToken cancellationToken = default);
}