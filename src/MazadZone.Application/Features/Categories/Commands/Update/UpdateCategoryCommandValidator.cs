using MazadZone.Application.Common.Validation;

namespace MazadZone.Application.Features.Categories.Commands.Update;

public sealed class UpdateCategoryCommandValidator : AbstractValidator<UpdateCategoryCommand>
{
    public UpdateCategoryCommandValidator()
    {
        RuleFor(x => x.CategoryId).MustBeValidCategoryId();

        RuleFor(x => x.Name).MustBeValidName();

        RuleFor(x => x.Description).MustBeValidDescription();
    }
}