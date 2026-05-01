
namespace MazadZone.Domain.Auctions;

[ValueObject<Guid>(conversions: Conversions.SystemTextJson | Conversions.TypeConverter )]
public partial struct BidderId
{
    public static BidderId New() => From(Guid.CreateVersion7());
    public static BidderId Load(Guid existingId) => From(existingId);
}


