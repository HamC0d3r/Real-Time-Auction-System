namespace MazadZone.Domain.Auctions;

[ValueObject<Guid>(conversions: Conversions.SystemTextJson | Conversions.TypeConverter )]
public partial struct AuctionId
{
    public static AuctionId New() => From(Guid.CreateVersion7());
}