using AuthService.Domain.Constants;

public static class EmailErrorCodes
{
    public const string AlreadyExists = "Email.AlreadyExists";
    public const string Empty = "Email.Empty";
    public const string InvalidFormat = "Email.InvalidFormat";
    public const string TooLong = "Email.TooLong";

}

public static class EmailErrors
{
    public static readonly Error Empty = Error.Validation(
        EmailErrorCodes.Empty,
        "The email address cannot be empty or whitespace.");

    public static readonly Error InvalidFormat = Error.Validation(
        EmailErrorCodes.InvalidFormat,
        "The email address format is invalid.");

    public static readonly Error TooLong = Error.Validation(
        EmailErrorCodes.TooLong,
        $"The email address cannot exceed {UserConstants.EmailMaxLength} characters.");
}