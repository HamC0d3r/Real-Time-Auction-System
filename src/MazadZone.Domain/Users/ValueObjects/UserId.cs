namespace MazadZone.Domain.Users.ValueObjects;

[ValueObject<Guid>(conversions: Conversions.SystemTextJson | Conversions.TypeConverter )]
public partial struct UserId
{
    public static UserId New() => From(Guid.CreateVersion7());
    public static UserId Load(Guid userId) => From(userId);
    public static UserId  Empty => From(Guid.Empty);
}