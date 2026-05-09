namespace MazadZone.Application.Features.Categories.Queries.GetCategoryTree;

using Microsoft.Extensions.Logging;

public static partial class GetCategoryTreeLogs
{
    [LoggerMessage(
        EventId = MazadLogEvents.Global.ResourceReadSuccess,
        Level = LogLevel.Information,
        Message = "Category tree hierarchy retrieved successfully.")]
    public static partial void LogSuccess(ILogger logger);
}