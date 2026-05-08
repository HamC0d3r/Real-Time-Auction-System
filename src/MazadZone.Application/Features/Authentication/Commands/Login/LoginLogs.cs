namespace MazadZone.Application.Features.Authentication.Commands.Login;

internal static partial class LoginLogs
{
    [LoggerMessage(
        EventId = MazadLogEvents.Authentication.InvalidCredentials,
        Level = LogLevel.Warning,
        Message = "Login failed. No account found for email: {Email}")]
    public static partial void LogUserNotFound(ILogger logger, string email);



    [LoggerMessage(
        EventId = MazadLogEvents.Authentication.TokenRotationRejected,
        Level = LogLevel.Warning,
        Message = "Login succeeded, but Domain rejected adding a refresh token for User {UserId}. Reason: {ErrorCode}")]
    public static partial void LogAddRefreshTokenFailed(ILogger logger, Guid userId, string errorCode);

    [LoggerMessage(
        EventId = MazadLogEvents.Authentication.LoginSuccess,
        Level = LogLevel.Information,
        Message = "User {UserId} logged in successfully.")]
    public static partial void LogLoginSuccess(ILogger logger, Guid userId);
}