namespace MazadZone.Application.Features.Categories.Commands.Restore;

using MazadZone.Domain.Categories;
using Microsoft.Extensions.Logging;

public static partial class RestoreCategoryLogs
{
    [LoggerMessage(
        EventId = MazadLogEvents.Categories.RestoreViolation, 
        Level = LogLevel.Warning, 
        Message = "Restore Failed: Category {CategoryId} could not be reinstated. Error: {ErrorCode} - {Description}")]
    public static partial void LogDomainRuleViolation(
        ILogger logger, 
        CategoryId categoryId, 
        string errorCode, 
        string description);

    [LoggerMessage(
        EventId = MazadLogEvents.Categories.RestoreSuccess, 
        Level = LogLevel.Information, 
        Message = "Category Reinstated: {CategoryId} is now active and visible in the marketplace hierarchy.")]
    public static partial void LogSuccess(ILogger logger, CategoryId categoryId);
}