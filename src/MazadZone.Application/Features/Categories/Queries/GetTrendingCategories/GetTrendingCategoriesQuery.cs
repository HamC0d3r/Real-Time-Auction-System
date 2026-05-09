namespace MazadZone.Application.Features.Categories.Queries.GetTrendingCategories;

public record GetTrendingCategoriesQuery(int Limit = 10) : IQuery<IReadOnlyList<TrendingCategoryResponse>>;