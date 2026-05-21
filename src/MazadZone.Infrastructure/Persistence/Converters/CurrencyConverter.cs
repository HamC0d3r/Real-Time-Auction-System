using MazadZone.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace MazadZone.Infrastructure.Persistence.Converters;

public class CurrencyConverter : ValueConverter<Currency, string>
{
    public CurrencyConverter() 
        : base(
            currency => currency.Code,             // Convert to string
            code => Currency.FromCode(code)        // Convert back to Currency
        ) 
    { 
    }
}