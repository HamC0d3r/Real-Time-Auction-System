using MazadZone.Domain.Auctions;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace MazadZone.Infrastructure.Persistence.Converters;

class AuctionIdConverter : ValueConverter<AuctionId, Guid>
{
    public AuctionIdConverter() 
        : base(id => id.Value, guid =>  AuctionId.From(guid)) { }
}