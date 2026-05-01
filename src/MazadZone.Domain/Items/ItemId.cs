namespace MazadZone.Domain.Items;

[ValueObject<Guid>(conversions: Conversions.SystemTextJson | Conversions.TypeConverter )]
public partial struct ItemId
{
    public static ItemId New() => From(Guid.CreateVersion7());
}

