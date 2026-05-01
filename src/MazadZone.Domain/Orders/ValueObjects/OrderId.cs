namespace MazadZone.Domain.Orders;

[ValueObject<Guid>(conversions: Conversions.SystemTextJson | Conversions.TypeConverter )]
public partial struct OrderId
{
    public static OrderId New() => From(Guid.CreateVersion7());
}


