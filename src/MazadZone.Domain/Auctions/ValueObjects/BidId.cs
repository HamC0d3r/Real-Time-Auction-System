
namespace MazadZone.Domain.Auctions;

[ValueObject<Guid>(conversions: Conversions.SystemTextJson | Conversions.TypeConverter)]
public partial struct BidId
{
    public static BidId New() => From(Guid.CreateVersion7());
    public static BidId Load(Guid guid) => From(guid);
    public static BidId Empty => From(Guid.Empty);
}


