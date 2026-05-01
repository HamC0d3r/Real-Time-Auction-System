namespace MazadZone.Domain.Orders.Events;

public sealed record DisputeOpenedDomainEvent(OrderId OrderId, DisputeId DisputeId) : IDomainEvent
{
    public Guid Id => Guid.NewGuid();
    public DateTime OccurredOnUtc => DateTime.UtcNow;
}
