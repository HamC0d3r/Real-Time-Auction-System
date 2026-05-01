namespace MazadZone.Domain.Orders;

[ValueObject<Guid>(conversions: Conversions.SystemTextJson | Conversions.TypeConverter)]
public partial struct DisputeId
{
 public static DisputeId New() => From(Guid.CreateVersion7());   
}


