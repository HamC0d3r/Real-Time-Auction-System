namespace MazadZone.Application.Features.Categories.Commands.MoveToParent;

using MazadZone.Domain.Categories;
using Microsoft.Extensions.Logging;

public static partial class MoveToParentLogs
{
    [LoggerMessage(
        EventId = MazadLogEvents.Categories.MoveToParentViolation,
        Level = LogLevel.Warning,
        Message = "Relocation Blocked: Hierarchy move for Category {CategoryId} violated domain rules. {ErrorCode} - {Description}")]
    public static partial void LogDomainRuleViolation(
        ILogger logger, 
        CategoryId categoryId, 
        string errorCode, 
        string description);

    [LoggerMessage(
        EventId = MazadLogEvents.Categories.MoveToParentSuccess,
        Level = LogLevel.Information,
        Message = "Hierarchy Reorganized: Category {CategoryId} was successfully moved to its new parent.")]
    public static partial void LogSuccess(ILogger logger, CategoryId categoryId);
}