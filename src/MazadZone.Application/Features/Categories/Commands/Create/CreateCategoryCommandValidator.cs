namespace MazadZone.Application.Features.Categories.Commands.Create;

using FluentValidation;

public sealed class CreateCategoryCommandValidator : AbstractValidator<CreateCategoryCommand>
{
    public CreateCategoryCommandValidator()
    {
        RuleFor(x => x.Name).MustBeValidName();
        RuleFor(x => x.Description).MustBeValidDescription();
    }
}