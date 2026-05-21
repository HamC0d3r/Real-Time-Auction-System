using MazadZone.Domain.Payments.ValueObjects;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace MazadZone.Infrastructure.Persistence.Converters;

public class TransactionIdConverter : ValueConverter<TransactionId, Guid>
{
    public TransactionIdConverter() 
        : base(id => id.Value, guid =>  TransactionId.From(guid)){}
}