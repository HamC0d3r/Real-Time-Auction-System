namespace MazadZone.Domain.Auctions;

[ValueObject<Guid>(conversions: Conversions.SystemTextJson | Conversions.TypeConverter )]
public partial struct UserId
{
    public static UserId New() => From(Guid.CreateVersion7());
}


