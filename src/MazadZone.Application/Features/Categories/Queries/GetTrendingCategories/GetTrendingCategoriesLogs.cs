namespace MazadZone.Application.Features.Categories.Queries.GetTrendingCategories;

using Microsoft.Extensions.Logging;

public static partial class GetTrendingCategoriesLogs
{
    [LoggerMessage(
        EventId = MazadLogEvents.Global.ResourceReadSuccess, 
        Level = LogLevel.Information,
        Message = "Retrieved top {Limit} trending categories based on 24h activity.")]
    public static partial void LogSuccess(ILogger logger, int limit);
}