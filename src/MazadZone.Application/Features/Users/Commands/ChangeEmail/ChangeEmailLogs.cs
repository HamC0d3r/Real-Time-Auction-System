using MazadZone.Domain.Users.ValueObjects;

namespace MazadZone.Features.Users.ChangeEmail;

internal static partial class ChangeEmailLogs
{
    [LoggerMessage(
        EventId = MazadLogEvents.Users.ChangeEmailConflict,
        Level = LogLevel.Warning,
        Message = "ChangeEmail Failed: {ErrorCode} - The email {Email} is already taken.")]
    public static partial void LogConflict(ILogger logger, string email, string errorCode);

    [LoggerMessage(
        EventId = MazadLogEvents.Users.ChangeEmailSuccess,
        Level = LogLevel.Information,
        Message = "ChangeEmail Success: User {UserId} changed their email to {NewEmail}.")]
    public static partial void LogSuccess(ILogger logger, UserId userId, string newEmail);
}