namespace MazadZone.Application.Features.Categories.Queries.GetRootCategories;

public record GetRootCategoriesQuery() : IQuery<IReadOnlyList<CategoryResponse>>;