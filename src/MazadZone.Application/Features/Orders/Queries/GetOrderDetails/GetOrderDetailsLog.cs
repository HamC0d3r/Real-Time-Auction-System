namespace MazadZone.Application.Features.Orders.Queries.GetOrderDetails;

internal static partial class GetOrderDetailsLog
{
    [LoggerMessage(
        EventId = MazadLogEvents.Orders.FetchingOrderDetails, 
        Level = LogLevel.Information, 
        Message = "Fetching details for Order: {OrderId}")]
    public static partial void LogFetching(ILogger logger, Guid orderId);
}