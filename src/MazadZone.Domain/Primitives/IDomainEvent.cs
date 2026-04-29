using MediatR;
namespace MazadZone.Domain.Primitives;

public interface IDomainEvent : INotification
{
    Guid Id { get; }
    DateTime OccurredOnUtc { get; }
}