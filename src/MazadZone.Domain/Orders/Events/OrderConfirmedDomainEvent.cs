namespace MazadZone.Domain.Orders.Events;

public sealed record OrderConfirmedDomainEvent(OrderId OrderId) : IDomainEvent
{
    public Guid Id => Guid.NewGuid();
    public DateTime OccurredOnUtc => DateTime.UtcNow;
}
