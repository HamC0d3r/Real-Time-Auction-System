namespace MazadZone.Domain.Users.Events;

using System;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Primitives;

public sealed record UserBannedDomainEvent(UserId UserId) : IDomainEvent
{
    public Guid Id => Guid.NewGuid();

    public DateTime OccurredOnUtc => DateTime.UtcNow;
}
