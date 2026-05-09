namespace MazadZone.Application.Features.Categories.Queries.GetBreadcrumbs;

using MazadZone.Domain.Categories;
using Microsoft.Extensions.Logging;

public static partial class GetCategoryBreadcrumbsLogs
{
    [LoggerMessage(
        EventId = MazadLogEvents.Global.ResourceReadSuccess, 
        Level = LogLevel.Information, 
        Message = "Breadcrumbs for {CategoryId} retrieved successfully.")]
    public static partial void LogSuccess(ILogger logger, CategoryId categoryId);
}