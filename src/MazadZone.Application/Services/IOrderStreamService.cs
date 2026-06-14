using MazadZone.Domain.Shared.Interfaces;

namespace MazadZone.Application.Services;

public interface IOrderStreamService : IScopedService
{
    Task BroadcastOrderStatusChangedAsync(Guid userId, Guid orderId, string newStatus, CancellationToken cancellationToken = default);

    Task BroadcastOrderCreatedAsync(Guid userId, Guid orderId, Guid auctionId, decimal finalBid, CancellationToken cancellationToken = default);
}
