namespace MazadZone.Application.Features.Categories.Queries.SearchCategories;

public record SearchCategoriesQuery(string SearchTerm) : IQuery<IReadOnlyList<CategoryResponse>>;