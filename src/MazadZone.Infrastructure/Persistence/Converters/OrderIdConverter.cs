using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using MazadZone.Domain.Orders;
using MazadZone.Domain.Users.ValueObjects;

namespace MazadZone.Infrastructure.Persistence.Converters;

public class OrderIdConverter : ValueConverter<OrderId, Guid>
{
    public OrderIdConverter() 
        : base(id => id.Value, guid =>  OrderId.From(guid)) { }
}

public class HashedRefreshTokenIdConverter : ValueConverter<HashedRefreshTokenId, Guid>
{
    public HashedRefreshTokenIdConverter() : base(id => id.Value, guid =>  HashedRefreshTokenId.From(guid)) { }
}
