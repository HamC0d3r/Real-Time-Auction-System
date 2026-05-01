namespace MazadZone.Application.Features.Orders.Queries.SearchOrders;

// 3. The Source-Generated Logger
public static partial class SearchOrdersLog
{
    [LoggerMessage(EventId = 95, Level = LogLevel.Information, Message = "Searching orders. Page: {Page}, Size: {Size}")]
    public static partial void LogSearchingOrders(this ILogger logger, int page, int size);
}
