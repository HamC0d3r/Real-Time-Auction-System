using MazadZone.Domain.Shared.Errors;

namespace MazadZone.Domain.Shared.ValueObjects;


public sealed record Name
{

    public string Value { get; init; }

    private Name(string value) => Value = value;

    public static Result<Name> Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value)) return NameErrors.Empty;

        if (value.Length > SharedConstainst.MaxNameLength)return NameErrors.TooLong;

        return Result.Success(new Name(value.Trim())); 
    }

    public static implicit operator string(Name name) => name.Value;
    
    public override string ToString() => Value;
}