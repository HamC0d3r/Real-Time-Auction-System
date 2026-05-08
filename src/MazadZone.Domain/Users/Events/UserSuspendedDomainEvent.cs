namespace MazadZone.Domain.Users.Events;

using System;
using MazadZone.Domain.Primitives;
using MazadZone.Domain.Users.ValueObjects;

public sealed record UserSuspendedDomainEvent(UserId UserId,string Email, string Reason, DateTime? ReinstatementDate) : IDomainEvent
{
    public Guid Id => Guid.NewGuid();

    public DateTime OccurredOnUtc => DateTime.UtcNow;
}
