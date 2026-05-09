namespace MazadZone.Application.Features.Categories.Commands.Create;

using MazadZone.Domain.Categories;
using Microsoft.Extensions.Logging;

public static partial class CreateCategoryLogs
{
    [LoggerMessage(
        EventId = MazadLogEvents.Categories.CreationViolation,
        Level = LogLevel.Warning,
        Message = "Category Creation Rejected: {ErrorCode} - {Description}")]
    public static partial void LogDomainRuleViolation(ILogger logger, string errorCode, string description);

    [LoggerMessage(
        EventId = MazadLogEvents.Categories.CreationSuccess,
        Level = LogLevel.Information,
        Message = "Category {CategoryId} successfully created and persisted.")]
    public static partial void LogSuccess(ILogger logger, CategoryId categoryId);
}