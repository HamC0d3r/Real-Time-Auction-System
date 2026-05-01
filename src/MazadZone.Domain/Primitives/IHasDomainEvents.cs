namespace MazadZone.Domain.Primitives;

using System.Collections.Generic;

public interface IHasDomainEvents
{
    IReadOnlyCollection<IDomainEvent> DomainEvents { get; }
    void ClearDomainEvents();
}