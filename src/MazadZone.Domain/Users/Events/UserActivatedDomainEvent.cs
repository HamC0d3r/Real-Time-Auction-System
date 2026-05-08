namespace MazadZone.Domain.Users.Events;

using System;
using MazadZone.Domain.Primitives;
using MazadZone.Domain.Users.ValueObjects;

public sealed record UserActivatedDomainEvent(UserId UserId, string Email) : IDomainEvent
{
    public Guid Id => Guid.NewGuid();

    public DateTime OccurredOnUtc => DateTime.UtcNow;
}