namespace MazadZone.Domain.Orders.Events;

public sealed record OrderShippedDomainEvent(OrderId OrderId) : IDomainEvent
{
    public Guid Id => Guid.NewGuid();
    public DateTime OccurredOnUtc => DateTime.UtcNow;
}
