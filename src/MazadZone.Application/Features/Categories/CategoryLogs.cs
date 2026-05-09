using MazadZone.Domain.Categories;

namespace MazadZone.Application.Features.Categories;
 public static partial class CategoryLogs
{
    [LoggerMessage(
            EventId = MazadLogEvents.Categories.DuplicateName,
            Level = LogLevel.Warning,
            Message = "Category creation failed: The name '{CategoryName}' already exists under Parent ID {ParentId}.")]
    public static partial void LogDuplicateName(ILogger logger, string categoryName, CategoryId? parentId);

} 