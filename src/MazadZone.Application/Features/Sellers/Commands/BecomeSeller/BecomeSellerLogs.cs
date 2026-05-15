using MazadZone.Domain.Auctions;
using MazadZone.Domain.Users.ValueObjects;

namespace MazadZone.Application.Features.Sellers.Commands.BecomeSeller;

internal static partial class BecomeSellerLogs
{
        [LoggerMessage(
        EventId = MazadLogEvents.Sellers.BecomeSellerDomainViolation,
        Level = LogLevel.Warning,
        Message = "Domain rule violation for User {UserId} becoming seller: {ErrorCode}")]
    public static partial void LogDomainRuleViolation(ILogger logger, UserId userId, string errorCode);


    [LoggerMessage(
        EventId = MazadLogEvents.Sellers.BecomeSellerSuccess,
        Level = LogLevel.Information,
        Message = "User {UserId} has successfully become a Seller.")]
    public static partial void LogSuccess(ILogger logger, UserId userId);
}