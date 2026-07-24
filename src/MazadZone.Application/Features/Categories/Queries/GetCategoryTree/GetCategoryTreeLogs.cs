namespace MazadZone.Application.Features.Categories.Queries.GetCategoryTree;

using Microsoft.Extensions.Logging;

public static partial class GetCategoryTreeLogs
{
    [LoggerMessage(
        EventId = MazadLogEvents.Global.ResourceReadSuccess,
        Level = LogLevel.Information,
        Message = "Category tree hierarchy retrieved successfully.")]
    public static partial void LogSuccess(ILogger logger);

    [LoggerMessage(
        EventId = MazadLogEvents.Global.CacheHit,
        Level = LogLevel.Debug,
        Message = "Category tree served from cache.")]
    public static partial void LogCacheHit(ILogger logger);
}