using MazadZone.Domain.Users.ValueObjects;

namespace MazadZone.Domain.Users.Events;

public record UserEmailChangedDomainEvent(UserId UserId, Email OldEmail, Email NewEmail) : IDomainEvent
{
    public Guid Id => Guid.NewGuid();
    public DateTime OccurredOnUtc => DateTime.UtcNow;
}
