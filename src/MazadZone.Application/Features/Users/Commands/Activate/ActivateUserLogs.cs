using MazadZone.Domain.Users.ValueObjects;

namespace MazadZone.Application.Features.Users.Commands.Activate;

internal static partial class ActivateUserLogs
{
    [LoggerMessage(
        EventId = MazadLogEvents.Users.ActivateDomainViolation,
        Level = LogLevel.Warning,
        Message = "Activation Rejected: User {UserId} is in a state that cannot be activated (Error: {ErrorCode}).")]
    public static partial void LogDomainViolation(ILogger logger, UserId userId, string errorCode);

    [LoggerMessage(
        EventId = MazadLogEvents.Users.ActivateSuccess,
        Level = LogLevel.Information, 
        Message = "User {UserId} activated successfully.")]
    public static partial void LogSuccess(ILogger logger, UserId userId);
}