namespace MazadZone.Domain.Primitives;

public interface IDomainEvent 
{
    Guid Id { get; }
    DateTime OccurredOnUtc { get; }
}