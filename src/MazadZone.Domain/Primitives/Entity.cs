namespace MazadZone.Domain.Primitives;

public abstract class Entity<TId> : IEquatable<Entity<TId>>
    where TId : notnull
{
    protected Entity(TId id) => Id = id;

    #pragma warning disable CS8618 
    #pragma warning disable CS0519
    protected Entity() { }
    #pragma warning restore CS8618


    public TId Id { get; private init; }

    // Standard DDD Equality implementation
    public static bool operator ==(Entity<TId>? first, Entity<TId>? second) =>
        first is not null && second is not null && first.Equals(second);

    public static bool operator !=(Entity<TId>? first, Entity<TId>? second) =>
        !(first == second);

    public bool Equals(Entity<TId>? other)
    {
        if (other is null) return false;
        if (other.GetType() != GetType()) return false;
        return EqualityComparer<TId>.Default.Equals(Id, other.Id);
    }

    public override bool Equals(object? obj) =>
        obj is Entity<TId> entity && Equals(entity);

    public override int GetHashCode() => Id.GetHashCode();
}