namespace MazadZone.Application.Features.Orders.Queries.GetOrderDetails;
public static partial class GetOrderDetailsLog
{
    [LoggerMessage(EventId = 93, Level = LogLevel.Information, Message = "Fetching details for Order: {OrderId}")]
    public static partial void LogFetchingOrderDetails(this ILogger logger, Guid orderId);
}