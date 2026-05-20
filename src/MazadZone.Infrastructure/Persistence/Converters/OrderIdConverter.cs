using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using MazadZone.Domain.Orders;

namespace MazadZone.Infrastructure.Persistence.Converters;

public class OrderIdConverter : ValueConverter<OrderId, Guid>
{
    public OrderIdConverter() 
        : base(id => id.Value, guid =>  OrderId.From(guid)) { }
}
