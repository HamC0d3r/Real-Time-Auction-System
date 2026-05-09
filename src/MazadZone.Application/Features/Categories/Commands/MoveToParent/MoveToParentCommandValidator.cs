using MazadZone.Application.Common.Validation;

namespace MazadZone.Application.Features.Categories.Commands.MoveToParent;

public sealed class MoveToParentCommandValidator : AbstractValidator<MoveToParentCommand>
{
    public MoveToParentCommandValidator()
    {
        RuleFor(x => x.CategoryId).MustBeValidCategoryId("Category Id");
        
        RuleFor(x => x.NewParentId)
            .NotEqual(x => x.CategoryId)
            .WithMessage("A category cannot be its own parent.");
    }
}