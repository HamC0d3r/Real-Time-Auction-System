namespace MazadZone.Domain.Orders.Events;

public sealed record FeedbackRepliedDomainEvent(OrderId OrderId, FeedbackId FeedbackId) : IDomainEvent
{
    public Guid Id => Guid.NewGuid();
    public DateTime OccurredOnUtc => DateTime.UtcNow;
}