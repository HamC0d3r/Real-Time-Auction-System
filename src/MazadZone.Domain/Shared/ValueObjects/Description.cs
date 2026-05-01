using MazadZone.Domain.Shared.Errors;

namespace MazadZone.Domain.Shared.ValueObjects;


public sealed record Description
{
    public string Value { get; init; }

    private Description(string value) => Value = value;

    public static Result<Description> Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value)) return DescriptionErrors.Empty;

        if (value.Length > SharedConstainst.MaxDescriptionLength) return DescriptionErrors.TooLong;

        return Result.Success(new Description(value.Trim()));
    }

    public static implicit operator string(Description description) => description.Value;
    
    public override string ToString() => Value;
}