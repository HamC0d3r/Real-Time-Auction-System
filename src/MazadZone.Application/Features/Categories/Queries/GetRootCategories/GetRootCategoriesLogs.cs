namespace MazadZone.Application.Features.Categories.Queries.GetRootCategories;

using Microsoft.Extensions.Logging;

public static partial class GetRootCategoriesLogs
{
    [LoggerMessage(
        EventId = MazadLogEvents.Global.ResourceReadSuccess,
        Level = LogLevel.Information,
        Message = "Root categories retrieved successfully.")]
    public static partial void LogSuccess(ILogger logger);
}