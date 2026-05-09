namespace MazadZone.Application.Features.Categories.Queries.SearchCategories;

using Microsoft.Extensions.Logging;

public static partial class SearchCategoriesLogs
{
    [LoggerMessage(
        EventId = MazadLogEvents.Global.ResourceReadSuccess, 
        Level = LogLevel.Information,
        Message = "Category search executed for term: {SearchTerm}")]
    public static partial void LogSuccess(ILogger logger, string searchTerm);
}