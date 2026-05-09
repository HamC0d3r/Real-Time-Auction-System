using MazadZone.Application.Common.Validation;

namespace MazadZone.Application.Features.Categories.Queries.GetById;

public sealed class GetCategoryByIdQueryValidator : AbstractValidator<GetCategoryByIdQuery>
{
    public GetCategoryByIdQueryValidator()
    {
        RuleFor(x => x.CategoryId).MustBeValidCategoryId();
    }
}