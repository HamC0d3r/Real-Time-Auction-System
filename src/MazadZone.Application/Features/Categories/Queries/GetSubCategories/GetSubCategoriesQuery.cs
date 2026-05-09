using MazadZone.Domain.Categories;

namespace MazadZone.Application.Features.Categories.Queries.GetSubCategories;


public record GetSubCategoriesQuery(CategoryId ParentId) : IQuery<IReadOnlyList<CategoryResponse>>;