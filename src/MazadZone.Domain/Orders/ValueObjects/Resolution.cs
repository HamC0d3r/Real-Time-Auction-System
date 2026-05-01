namespace MazadZone.Domain.Orders;

public sealed record Resolution
{
    public const int MaxLength = 1000;
    public const int MinLength = 10;

    public string Value { get; init; }

    private Resolution(string value)
    {
        Value = value;
    }

    /// <summary>
    /// Factory method to enforce domain invariants before creating a Resolution.
    /// </summary>
    public static Result<Resolution> Create(string resolutionText)
    {
        if (string.IsNullOrWhiteSpace(resolutionText))
            return ResolutionErrors.Empty;

        var sanitizedText = resolutionText.Trim();

        if (sanitizedText.Length < MinLength) return ResolutionErrors.TooShort;

        if (sanitizedText.Length > MaxLength) return ResolutionErrors.TooLong;

        return new Resolution(sanitizedText);
    }

    // Optional: Implicit conversion to string makes it easier to use with standard APIs
    public static implicit operator string(Resolution resolution) => resolution.Value;
}