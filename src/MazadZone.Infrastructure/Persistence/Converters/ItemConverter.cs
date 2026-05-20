using MazadZone.Domain.Auctions.ValueObjects;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace MazadZone.Infrastructure.Persistence.Converters;

class ItemConverter : ValueConverter<ItemId, Guid>
{
    public ItemConverter() 
        : base(id => id.Value, guid =>  ItemId.From(guid)) { }
}