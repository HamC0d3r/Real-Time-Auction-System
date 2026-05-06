namespace MazadZone.Domain.Users.ValueObjects;

[ValueObject<Guid>(conversions: Conversions.SystemTextJson | Conversions.TypeConverter )]
public partial struct RefreshTokenId
{
    public static RefreshTokenId New() => From(Guid.CreateVersion7());
}


