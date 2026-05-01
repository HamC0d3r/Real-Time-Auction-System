namespace MazadZone.Domain.Orders;

[ValueObject<Guid>(conversions: Conversions.SystemTextJson | Conversions.TypeConverter )]
public partial struct FeedbackId
{
    public static FeedbackId New() => From(Guid.CreateVersion7());
}


