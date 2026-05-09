using MazadZone.Application.Common.Validation;

namespace MazadZone.Application.Features.Categories.Queries.GetBreadcrumbs;

public class GetCategoryBreadcrumbsQueryValidator : AbstractValidator<GetCategoryBreadcrumbsQuery>
{
    public GetCategoryBreadcrumbsQueryValidator()
    {
        RuleFor(x => x.CategoryId).MustBeValidCategoryId();
    }
}