using MazadZone.Domain.Payments.ValueObjects;
using MzadZone.Domain.Payments.Entities;

namespace MazadZone.Domain.Payments.Events;

public sealed record PaymentAuthorizedDomainEvent(
    PaymentId PaymentId,
    OrderId OrderId
    ) : IDomainEvent
{
    public Guid Id => Guid.NewGuid();

    public DateTime OccurredOnUtc => DateTime.UtcNow;
}