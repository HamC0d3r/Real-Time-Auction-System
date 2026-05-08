namespace MazadZone.Application.Features.Orders.Queries.SearchOrders;

internal static partial class SearchOrdersLog
{
    [LoggerMessage(
        EventId = MazadLogEvents.Orders.SearchingOrders, 
        Level = LogLevel.Information, 
        Message = "Searching orders. Page: {Page}, Size: {Size}")]
    public static partial void LogSearching(ILogger logger, int page, int size);
}
