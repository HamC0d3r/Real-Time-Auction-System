using MazadZone.Domain.Users.ValueObjects;

namespace MazadZone.Application.Features.Users.Commands.ChangePassword;

internal static partial class ChangePasswordLogs
{
    [LoggerMessage(
        Level = LogLevel.Critical,
        EventId = MazadLogEvents.Users.ChangePasswordHashingError,
        Message = "Change Password Failed: {ErrorCode} - Internal error during password hashing for UserId {UserId}.")]
    public static partial void LogHashingError(ILogger logger,  UserId userId, string errorCode);

    [LoggerMessage(
        Level = LogLevel.Information,
        EventId = MazadLogEvents.Users.ChangePasswordSuccess,
        Message = "Change Password Success: User {UserId} successfully updated their password.")]
    public static partial void LogSuccess(ILogger logger, UserId userId);
}