namespace MazadZone.Application.Features.Orders.Queries.GetSellerStats;

public static partial class GetSellerStatsLog
{
    [LoggerMessage(EventId = 94, Level = LogLevel.Information, Message = "Calculating statistics for Seller: {SellerId}")]
    public static partial void LogCalculatingSellerStats(this ILogger logger, Guid sellerId);
}
