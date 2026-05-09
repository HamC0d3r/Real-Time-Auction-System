namespace MazadZone.Application.Features.Categories.Queries.GetCategoryStatistics;

public record GetCategoryStatisticsQuery() : IQuery<IReadOnlyList<CategoryStatResponse>>;