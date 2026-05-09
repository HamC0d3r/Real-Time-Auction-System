using MazadZone.Domain.Categories;

namespace MazadZone.Application.Features.Categories.Queries.GetById;

public record GetCategoryByIdQuery(CategoryId CategoryId) : IQuery<CategoryResponse>;