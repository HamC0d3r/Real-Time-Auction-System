using MazadZone.Domain.Users.ValueObjects;

namespace MazadZone.Domain.Users.Events;

public record UserPasswordChangedDomainEvent(UserId UserId, Email CurrentEmail) : IDomainEvent
{
    public Guid Id => Guid.NewGuid();
    public DateTime OccurredOnUtc => DateTime.UtcNow;
}