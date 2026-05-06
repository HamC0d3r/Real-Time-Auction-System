namespace MazadZone.Domain.Shared.Errors;

public static class ReasonErrorCodes
{
    public const string Empty = "Reason.Empty";
    public const string TooLong = "Reason.TooLong";
    public const string TooShort = "Reason.TooShort";

}

public static class ReasonErrors
{
    public static Error Empty => Error.Validation(
        ReasonErrorCodes.Empty,
         "The reason cannot be empty.");
    public static Error TooLong => Error.Validation(
        ReasonErrorCodes.TooLong,
        $"The reason cannot exceed {SharedConstainst.MaxReasonLength} characters.");
    public static Error TooShort => Error.Validation(
        ReasonErrorCodes.TooShort,
        $"The reason must be at least {SharedConstainst.MinReasonLength} characters long.");
}