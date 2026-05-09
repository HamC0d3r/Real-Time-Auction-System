namespace MazadZone.Application.Features.Categories.Queries.GetCategoryTree;


public record GetCategoryTreeQuery() : IQuery<IReadOnlyList<CategoryTreeResponse>>;