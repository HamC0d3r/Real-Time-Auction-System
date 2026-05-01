namespace MazadZone.Domain.Shared.Errors;


public static class NameErrors
{
    public const string EmptyNameCode = "Name.Empty";
    public const string TooLongNameCode = "Name.TooLong";
    public static readonly Error Empty = Error.Validation(
        EmptyNameCode,
        "The name cannot be empty or whitespace.");

    public static readonly Error TooLong = Error.Validation(
        TooLongNameCode,
        $"The name cannot exceed {SharedConstainst.MaxNameLength} characters.");
}
