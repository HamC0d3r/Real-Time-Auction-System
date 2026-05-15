using MazadZone.Domain.Payments.ValueObjects;

namespace MazadZone.Domain.Payments.Events;

public record PaymentAmountUpdatedDomainEvent(
    PaymentId PaymentId, OrderId OrderId
    ) : IDomainEvent
{
    public Guid Id => Guid.NewGuid();

    public DateTime OccurredOnUtc => DateTime.UtcNow;
}