using MazadZone.Domain.Auctions;

namespace MazadZone.Domain.Orders.Events;
public sealed record DisputeResolvedDomainEvent(OrderId OrderId,AuctionId AuctionId, DisputeId DisputeId, string Resolution) : IDomainEvent
{
    public Guid Id => Guid.NewGuid();
    public DateTime OccurredOnUtc => DateTime.UtcNow;
}