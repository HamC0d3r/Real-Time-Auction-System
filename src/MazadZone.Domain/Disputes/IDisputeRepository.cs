using MazadZone.Domain.Repositories;
using MazadZone.Domain.Shared.Interfaces;

namespace MazadZone.Domain.Disputes;

public interface IDisputeRepository :IGenericRepository<Dispute, DisputeId>, IScopedService
{
    Task<Dispute?> GetByOrderIdAsync(OrderId orderId, CancellationToken ct);
    Task<bool> OrderHasOpenDisputeAsync(OrderId orderId, CancellationToken ct);
}