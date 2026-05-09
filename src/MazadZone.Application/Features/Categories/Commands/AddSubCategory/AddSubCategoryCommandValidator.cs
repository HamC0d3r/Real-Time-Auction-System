namespace MazadZone.Application.Features.Categories.Commands.AddSubCategory;

using FluentValidation;
using MazadZone.Application.Common.Validation;

public sealed class AddSubCategoryCommandValidator : AbstractValidator<AddSubCategoryCommand>
{
    public AddSubCategoryCommandValidator()
    {
        RuleFor(x => x.ParentId).MustBeValidCategoryId("Parent Id ");

        RuleFor(x => x.SubCategoryId).MustBeValidCategoryId("Sub Category Id")
            .NotEqual(x => x.ParentId)
            .WithMessage("Sub-category cannot be the same as the parent category.");
    }
}