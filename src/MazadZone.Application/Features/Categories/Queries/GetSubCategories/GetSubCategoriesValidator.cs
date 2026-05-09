using MazadZone.Application.Common.Validation;

namespace MazadZone.Application.Features.Categories.Queries.GetSubCategories;


public sealed class GetSubCategoriesValidator : AbstractValidator<GetSubCategoriesQuery>
{
    public GetSubCategoriesValidator()
    {
        RuleFor(x => x.ParentId).MustBeValidCategoryId("Parent Id");
    }
}