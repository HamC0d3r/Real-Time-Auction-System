namespace MazadZone.Application.Features.Categories.Queries.GetCategoryStatistics;

using Microsoft.Extensions.Logging;

public static partial class GetCategoryStatisticsLogs
{
    [LoggerMessage(
        EventId = MazadLogEvents.Global.ResourceReadSuccess, // e.g., 9021
        Level = LogLevel.Information,
        Message = "Active auction statistics per category retrieved.")]
    public static partial void LogSuccess(ILogger logger);
}