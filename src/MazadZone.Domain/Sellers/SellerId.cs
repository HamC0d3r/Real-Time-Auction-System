namespace MazadZone.Domain.Auctions;

[ValueObject<Guid>(conversions: Conversions.SystemTextJson | Conversions.TypeConverter)]
public partial struct SellerId 
{
    public static SellerId New() => From(Guid.CreateVersion7());
    public static SellerId Load(Guid existingId) => From(existingId);
}
