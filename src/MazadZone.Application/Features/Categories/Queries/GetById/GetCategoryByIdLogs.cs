namespace MazadZone.Application.Features.Categories.Queries.GetById;

using MazadZone.Domain.Categories;
using Microsoft.Extensions.Logging;

public static partial class GetCategoryByIdLogs
{
    [LoggerMessage(
        EventId = MazadLogEvents.Global.ResourceReadSuccess,
        Level = LogLevel.Information,
        Message = "Read Side: Category {CategoryId} details retrieved successfully.")]
    public static partial void LogSuccess(ILogger logger, CategoryId categoryId);
}
