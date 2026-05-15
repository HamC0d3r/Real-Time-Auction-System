using MazadZone.Domain.Payments.ValueObjects;

namespace MazadZone.Domain.Payments.Events;

public sealed record PaymentAuthHoldedCapturedDomainEvent(
    PaymentId PaymentId,
    OrderId OrderId
) : IDomainEvent
{
    public Guid Id => Guid.NewGuid();

    public DateTime OccurredOnUtc => DateTime.UtcNow;
}