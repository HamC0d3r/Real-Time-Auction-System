using MazadZone.Domain.Auctions.ValueObjects;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace MazadZone.Infrastructure.Persistence.Converters;

class ItemIdConverter : ValueConverter<ItemId, Guid>
{
    public ItemIdConverter() 
        : base(id => id.Value, guid =>  ItemId.From(guid)) { }
}