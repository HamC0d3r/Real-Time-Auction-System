namespace MazadZone.Domain.Payments.ValueObjects;

[ValueObject<Guid>(conversions: Conversions.SystemTextJson | Conversions.TypeConverter)]
public partial struct PaymentId
{
    public static PaymentId New() => From(Guid.CreateVersion7());
}

