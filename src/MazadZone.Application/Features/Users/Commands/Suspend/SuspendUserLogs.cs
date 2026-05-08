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

    [LoggerMessage(
            EventId = MazadLogEvents.Users.SuspensionCacheInvalidated,
            Level = LogLevel.Information,
            Message = "Security and profile cache cleared for suspended user {UserId}")]
    public static partial void LogCacheCleared(ILogger logger, UserId userId);

    [LoggerMessage(
        EventId = MazadLogEvents.Users.SuspensionNotificationSent,
        Level = LogLevel.Information,
        Message = "Suspension notifications (Email & In-App) dispatched to user {UserId}")]
    public static partial void LogNotificationsSent(ILogger logger, UserId userId);

    [LoggerMessage(
        EventId = MazadLogEvents.Users.SuspensionAuctionsCancelled,
        Level = LogLevel.Information,
        Message = "Suspension effect: {Count} auctions cancelled for seller {UserId}")]
    public static partial void LogAuctionsCancelled(ILogger logger, UserId userId, int count);

    [LoggerMessage(
            EventId = MazadLogEvents.Users.SuspensionBidsRemoved,
            Level = LogLevel.Information,
            Message = "Suspension effect: {Count} bids removed from active auctions for bidder {UserId}")]
    public static partial void LogBidsRemoved(ILogger logger, UserId userId, int count);
}