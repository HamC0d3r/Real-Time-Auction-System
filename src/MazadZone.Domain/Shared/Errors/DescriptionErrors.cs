namespace MazadZone.Domain.Shared.Errors;

public static class DescriptionErrors
{
    public const string EmptyDescriptionCode = "Description.Empty";
    public const string TooLongDescriptionCode = "Description.TooLong";
    public static readonly Error Empty = Error.Validation(
        EmptyDescriptionCode,
        "The description cannot be empty or whitespace.");

    public static readonly Error TooLong = Error.Validation(
        TooLongDescriptionCode,
        $"The description cannot exceed {SharedConstainst.MaxDescriptionLength} characters.");
}