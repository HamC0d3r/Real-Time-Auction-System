namespace MazadZone.Application.Features.Categories.Commands.Delete;

using MazadZone.Domain.Categories;
using Microsoft.Extensions.Logging;

public static partial class DeleteCategoryLogs
{
    [LoggerMessage(
        EventId = MazadLogEvents.Categories.DeleteViolation,
        Level = LogLevel.Warning,
        Message = "Category Deletion Blocked: {ErrorCode} - {Description}")]
    public static partial void LogDomainRuleViolation(ILogger logger, string errorCode, string description);

    [LoggerMessage(
        EventId = MazadLogEvents.Categories.DeleteSuccess,
        Level = LogLevel.Information,
        Message = "Category {CategoryId} and its nested hierarchy successfully marked as soft-deleted.")]
    public static partial void LogSuccess(ILogger logger, CategoryId categoryId);
}