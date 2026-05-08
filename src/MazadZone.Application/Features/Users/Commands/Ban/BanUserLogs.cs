using Microsoft.Extensions.Logging;
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

    // --- Event Handler Logs ---

    [LoggerMessage(
        EventId = MazadLogEvents.Users.BanAuctionsCancelled,
        Level = LogLevel.Information,
        Message = "Banned user {UserId}: {Count} active auctions have been cancelled.")]
    public static partial void LogAuctionsCancelled(ILogger logger, UserId userId, int count);

    [LoggerMessage(
        EventId = MazadLogEvents.Users.BanBidsRemoved,
        Level = LogLevel.Information,
        Message = "Banned user {UserId}: {Count} active bids were removed from ongoing auctions.")]
    public static partial void LogBidsRemoved(ILogger logger, UserId userId, int count);

    [LoggerMessage(
        EventId = MazadLogEvents.Users.BanCacheInvalidated,
        Level = LogLevel.Debug,
        Message = "Security cache invalidated for banned user {UserId}.")]
    public static partial void LogCacheCleared(ILogger logger, UserId userId);

    [LoggerMessage(
        EventId = MazadLogEvents.Users.BanNotificationSent,
        Level = LogLevel.Information,
        Message = "Ban notification email successfully dispatched to user {UserId}.")]
    public static partial void LogEmailSent(ILogger logger, UserId userId);
}