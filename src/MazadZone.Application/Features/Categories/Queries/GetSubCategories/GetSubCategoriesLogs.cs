namespace MazadZone.Application.Features.Categories.Queries.GetSubCategories;

using MazadZone.Domain.Categories;
using Microsoft.Extensions.Logging;

public static partial class GetSubCategoriesLogs
{
    [LoggerMessage(
        EventId = MazadLogEvents.Global.ResourceReadSuccess,
        Level = LogLevel.Information,
        Message = "Sub-categories for Parent {ParentId} retrieved successfully.")]
    public static partial void LogSuccess(ILogger logger, CategoryId parentId);
}