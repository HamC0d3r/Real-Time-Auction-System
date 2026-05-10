namespace MazadZone.Application.Features.Categories.Commands.Restore;

using MazadZone.Application.Common.Validation;

public sealed class RestoreCategoryCommandValidator : AbstractValidator<RestoreCategoryCommand>
{
    public RestoreCategoryCommandValidator()
    {
        RuleFor(x => x.CategoryId).MustBeValidCategoryId();
    }
}