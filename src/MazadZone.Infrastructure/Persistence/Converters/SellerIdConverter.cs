using MazadZone.Domain.Sellers;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace MazadZone.Infrastructure.Persistence.Converters;

class SellerIdConverter : ValueConverter<SellerId, Guid>
{
    public SellerIdConverter() 
        : base(id => id.Value, guid =>  SellerId.From(guid)) { }
}