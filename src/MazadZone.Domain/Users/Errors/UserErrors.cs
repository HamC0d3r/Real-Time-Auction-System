namespace MazadZone.Domain.Users.Errors;

public static class UserErrorCodes
{
    public const string NotFound = "User.NotFound";
    public const string InvalidCredentials = "User.InvalidCredentials"; // ✅ We will use this for Login
    public const string AlreadyVerified = "User.AlreadyVerified";


    public const string AlreadySuspended = "User.AlreadySuspended";
    public const string AlreadyBanned = "User.AlreadyBanned";
    public const string CannotSuspendBannedUser = "User.CannotSuspendBannedUser";
    public const string CannotActivateBannedUser = "User.CannotActivateBannedUser";
    public const string AlreadyActive = "User.AlreadyActive";
public const string CannotAuthenticateBannedUser = "User.CannotAuthenticateBannedUser";
    public const string UserIsSuspended = "User.UserIsSuspended";


    // Password Validation
    public const string IdRequired = "User.IdRequired";
    public const string CurrentPasswordRequired = "User.CurrentPasswordRequired";
    public const string NewPasswordRequired = "User.NewPasswordRequired";
    public const string NewPasswordLength = "User.NewPasswordLength";
    public const string NewPasswordFormat = "User.NewPasswordFormat";
    public const string ConfirmPasswordRequired = "User.ConfirmPasswordRequired";
    public const string PasswordsDoNotMatch = "User.PasswordsDoNotMatch";
    public const string PasswordHashError = "Password.HashError";
}

public static class UserErrors
{

    public static Error NotFound => Error.NotFound(
    UserErrorCodes.NotFound,
    "User  not found.");

    public static Error InvalidCredentials => Error.Unauthorized(
        UserErrorCodes.InvalidCredentials,
        "Invalid email or password.");

    public static Error AlreadyVerified => Error.Conflict(
        UserErrorCodes.AlreadyVerified,
        "The user account has already been verified.");

    public static readonly Error AlreadySuspended = Error.Conflict(
                UserErrorCodes.AlreadySuspended,
                "The user account is already suspended.");

    public static readonly Error AlreadyBanned = Error.Conflict(
        UserErrorCodes.AlreadyBanned,
        "The user account is already permanently banned.");

    public static readonly Error CannotSuspendBannedUser = Error.Conflict(
        UserErrorCodes.CannotSuspendBannedUser,
        "Cannot suspend a user because they are already permanently banned.");

    public static readonly Error CannotActivateBannedUser = Error.Conflict(
        UserErrorCodes.CannotActivateBannedUser,
        "A permanently banned user cannot be reactivated.");

    public static readonly Error AlreadyActive = Error.Conflict(
        UserErrorCodes.AlreadyActive,
        "The user account is already active.");

    public static readonly Error CannotAuthenticateBannedUser = Error.Validation(
            UserErrorCodes.CannotAuthenticateBannedUser,
            "The user account is banned and cannot perform authentication actions.");

public static readonly Error UserIsSuspended = Error.Validation(
    UserErrorCodes.UserIsSuspended,
    "The user account is currently suspended and cannot start a new session.");
}

    
