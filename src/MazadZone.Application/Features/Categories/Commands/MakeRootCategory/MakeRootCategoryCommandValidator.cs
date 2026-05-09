namespace MazadZone.Application.Features.Categories.Commands.MakeRootCategory;

using FluentValidation;
using MazadZone.Application.Common.Validation;

public sealed class MakeRootCategoryCommandValidator : AbstractValidator<MakeRootCategoryCommand>
{
    public MakeRootCategoryCommandValidator()
    {
        RuleFor(x => x.CategoryId).MustBeValidCategoryId("Category Id");
    }
}