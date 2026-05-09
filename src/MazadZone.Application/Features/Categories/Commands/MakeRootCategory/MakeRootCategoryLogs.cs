namespace MazadZone.Application.Features.Categories.Commands.MakeRootCategory;

using MazadZone.Domain.Categories;
using Microsoft.Extensions.Logging;

public static partial class MakeRootCategoryLogs
{
    [LoggerMessage(
        EventId = MazadLogEvents.Categories.MakeRootViolation, 
        Level = LogLevel.Warning, 
        Message = "Promotion Failure: Category {CategoryId} could not be moved to Root. Error: {ErrorCode} - {Description}")]
    public static partial void LogDomainRuleViolation(ILogger logger, CategoryId categoryId, string errorCode, string description);

    [LoggerMessage(
        EventId = MazadLogEvents.Categories.MakeRootSuccess, 
        Level = LogLevel.Information, 
        Message = "Hierarchy Updated: Category {CategoryId} has been successfully promoted to a Root Category.")]
    public static partial void LogSuccess(ILogger logger, CategoryId categoryId);
}