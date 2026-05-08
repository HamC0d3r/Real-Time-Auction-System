using MazadZone.Domain.Users.ValueObjects;

namespace MazadZone.Application.Features.Users.Commands.Ban;

internal static partial class BanUserLogs
{
    [LoggerMessage(
        EventId = MazadLogEvents.Users.BanSuccess,
        Level = LogLevel.Information,
        Message = "User {UserId} has been Banned. Reason: {Reason}")]
    public static partial void LogSuccess(ILogger logger, UserId userId, string reason);

    [LoggerMessage(
        EventId = MazadLogEvents.Users.BanDomainViolation,
        Level = LogLevel.Warning,
        Message = "Ban Rejected: User {UserId} state transition failed with error {ErrorCode}.")]
    public static partial void LogDomainViolation(ILogger logger, UserId userId, string errorCode);
}