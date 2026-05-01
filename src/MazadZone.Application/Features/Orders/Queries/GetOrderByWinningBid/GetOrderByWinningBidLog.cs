namespace MazadZone.Application.Features.Orders.Queries.GetOrderByWinningBid;

public static partial class GetOrderByWinningBidLog
{
    [LoggerMessage(EventId = 91, Level = LogLevel.Information, Message = "Resolving order for Winning Bid: {BidId}")]
    public static partial void LogResolvingOrderByBid(this ILogger logger, Guid bidId);

    // New log for the NotFound scenario
    [LoggerMessage(EventId = 92, Level = LogLevel.Warning, Message = "Order not found for Winning Bid ID: {BidId}")]
    public static partial void LogOrderNotFoundForBid(this ILogger logger, Guid bidId);
}
