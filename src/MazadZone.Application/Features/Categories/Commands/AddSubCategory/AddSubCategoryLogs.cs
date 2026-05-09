namespace MazadZone.Application.Features.Categories.Commands.AddSubCategory;

using MazadZone.Domain.Categories;
using Microsoft.Extensions.Logging;

public static partial class AddSubCategoryLogs
{
    [LoggerMessage(
        EventId = MazadLogEvents.Categories.AddSubCategoryViolation, 
        Level = LogLevel.Warning, 
        Message = "Category Hierarchy Violation: {ErrorCode} - {Description}")]
    public static partial void LogDomainRuleViolation(ILogger logger, string errorCode, string description);

    [LoggerMessage(
        EventId = MazadLogEvents.Categories.AddSubCategorySuccess, 
        Level = LogLevel.Information, 
        Message = "SubCategory {SubId} successfully attached to Parent Category {ParentId}.")]
    public static partial void LogSuccess(ILogger logger, CategoryId parentId, CategoryId subId);
}