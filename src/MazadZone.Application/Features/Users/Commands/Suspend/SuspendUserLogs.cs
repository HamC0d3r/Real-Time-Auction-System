using MazadZone.Domain.Users.ValueObjects;

namespace MazadZone.Application.Features.Users.Commands.Suspend;

internal static partial class SuspendUserLogs
{
    [LoggerMessage(
        EventId = MazadLogEvents.Users.SuspendSuccess,
        Level = LogLevel.Information,
        Message = "User {UserId} suspended until {UntilDate}.")]
    public static partial void LogSuccess(ILogger logger, UserId userId, DateTime untilDate);

    [LoggerMessage(
        EventId = MazadLogEvents.Users.SuspendDomainViolation,
        Level = LogLevel.Warning,
        Message = "Suspension Rejected: User {UserId} state transition failed (Error: {ErrorCode}).")]
    public static partial void LogDomainViolation(ILogger logger, UserId userId, string errorCode);
}