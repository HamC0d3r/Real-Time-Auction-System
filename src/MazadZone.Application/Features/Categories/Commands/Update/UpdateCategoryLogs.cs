namespace MazadZone.Application.Features.Categories.Commands.Update;

using MazadZone.Domain.Categories;
using Microsoft.Extensions.Logging;

public static partial class UpdateCategoryLogs
{
    [LoggerMessage(
        EventId = MazadLogEvents.Categories.UpdateSuccess,
        Level = LogLevel.Information,
        Message = "Update Successful: Category {CategoryId} attributes were successfully updated.")]
    public static partial void LogSuccess(ILogger logger, CategoryId categoryId);
}