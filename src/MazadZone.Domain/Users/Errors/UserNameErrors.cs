using AuthService.Domain.Constants;

namespace MazadZone.Domain.Users.Errors;

public static class UserNameErrorCodes
{
    public const string Empty = "UserName.Empty";
    public const string TooShort = "UserName.TooShort";
    public const string TooLong = "UserName.TooLong";
    public const string InvalidFormat = "UserName.InvalidFormat";
}

public static class UserNameErrors
{
    public static readonly Error Empty = Error.Validation(
        UserNameErrorCodes.Empty, 
        "The username cannot be empty or whitespace.");

    public static readonly Error TooShort = Error.Validation(
        UserNameErrorCodes.TooShort, 
        $"The username must be at least {UserConstants.UserNameMinLength} characters long.");

    public static readonly Error TooLong = Error.Validation(
        UserNameErrorCodes.TooLong, 
        $"The username cannot exceed {UserConstants.UserNameMaxLength} characters.");

    public static readonly Error InvalidFormat = Error.Validation(
        UserNameErrorCodes.InvalidFormat, 
        "The username can only contain letters, numbers, and underscores.");
}