namespace MazadZone.Application.Features.Categories.Commands.Restore;

using FluentValidation;
using MazadZone.Application.Common.Validation;

public sealed class RestoreCategoryCommandValidator : AbstractValidator<RestoreCategoryCommand>
{
    public RestoreCategoryCommandValidator()
    {
        RuleFor(x => x.CategoryId).MustBeValidCategoryId();
    }
}