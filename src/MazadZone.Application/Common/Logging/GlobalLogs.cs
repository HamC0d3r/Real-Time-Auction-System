using MazadZone.Domain.Auctions;
using MazadZone.Domain.Users.ValueObjects;

public static partial class GlobalLogs
{

    [LoggerMessage(
        EventId = MazadLogEvents.Global.NotFound,
        Level = LogLevel.Warning,
        Message = "Resource missing: Bidder with ID {bidderId} could not be found.")]
    public static partial void LogBidderNotFound(ILogger logger, BidderId bidderId);

    [LoggerMessage(
        EventId = MazadLogEvents.Global.NotFound,
        Level = LogLevel.Warning,
        Message = "Resource missing: Seller with ID {sellerId} could not be found.")]
    public static partial void LogSellerNotFound(ILogger logger, SellerId sellerId);

    [LoggerMessage(
        EventId = MazadLogEvents.Global.NotFound,
        Level = LogLevel.Warning,
        Message = "Resource missing: User with ID {userId} could not be found.")]
    public static partial void LogUserNotFound(ILogger logger, UserId userId);

    [LoggerMessage(
        EventId = MazadLogEvents.Global.NotFound,
        Level = LogLevel.Warning,
        Message = "Resource missing: Order with ID {orderId} could not be found.")]
    public static partial void LogOrderNotFound(ILogger logger, OrderId orderId);




}