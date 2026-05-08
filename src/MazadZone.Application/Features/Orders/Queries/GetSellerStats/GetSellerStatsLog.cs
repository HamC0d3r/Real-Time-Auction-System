namespace MazadZone.Application.Features.Orders.Queries.GetSellerStats;

internal static partial class GetSellerStatsLog
{
    [LoggerMessage(
        EventId = MazadLogEvents.Orders.CalculatingSellerStats, 
        Level = LogLevel.Information, 
        Message = "Calculating statistics for Seller: {SellerId}")]
    public static partial void LogCalculating(ILogger logger, Guid sellerId);
}
