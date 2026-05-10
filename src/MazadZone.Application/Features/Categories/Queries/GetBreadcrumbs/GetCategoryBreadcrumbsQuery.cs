using MazadZone.Domain.Categories;

namespace MazadZone.Application.Features.Categories.Queries.GetBreadcrumbs;


public record GetCategoryBreadcrumbsQuery(CategoryId CategoryId) : IQuery<IReadOnlyList<BreadcrumbResponse>>;