using MazadZone.Domain.Payments.ValueObjects;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace MazadZone.Infrastructure.Persistence.Converters;

public class PaymentIdConverter : ValueConverter<PaymentId, Guid>
{
    public PaymentIdConverter() 
        : base(id => id.Value, guid =>  PaymentId.From(guid)){}
    
}