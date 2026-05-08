using MazadZone.Domain.Auctions;

namespace MazadZone.Application.Features.Orders.Queries.GetOrderByWinningBid;

internal static partial class GetOrderByWinningBidLog
{
    [LoggerMessage(
        EventId = MazadLogEvents.Orders.ResolvingOrderByBid, 
        Level = LogLevel.Information, 
        Message = "Resolving order for Winning Bid: {BidId}")]
    public static partial void LogResolving(ILogger logger, BidId bidId);

    [LoggerMessage(
        EventId = MazadLogEvents.Orders.OrderNotFoundForBid, 
        Level = LogLevel.Warning, 
        Message = "Order not found for Winning Bid ID: {BidId}")]
    public static partial void LogNotFound(ILogger logger, BidId bidId);
}
