namespace MazadZone.Domain.ValueObjects;

public sealed record Currency
{
    // Pre-defined allowed currencies
    public static readonly Currency Usd = new("USD");
    public static readonly Currency Jod = new("JOD"); 
    public static readonly Currency Eur = new("EUR");

    public string Code { get; }

    private Currency(string code)
    {
        Code = code;
    }

    public static Currency FromCode(string code)
    {
        return code.ToUpperInvariant() switch
        {
            "USD" => Usd,
            "JOD" => Jod,
            "EUR" => Eur,
            _ => throw new ArgumentException($"Currency code '{code}' is not supported.")
        };
    }

    public override string ToString() => Code;
}