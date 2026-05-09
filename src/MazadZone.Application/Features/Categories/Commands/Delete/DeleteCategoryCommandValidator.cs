namespace MazadZone.Application.Features.Categories.Commands.Delete;

using FluentValidation;
using MazadZone.Application.Common.Validation;

public sealed class DeleteCategoryCommandValidator : AbstractValidator<DeleteCategoryCommand>
{
    public DeleteCategoryCommandValidator()
    {
        RuleFor(x => x.CategoryId).MustBeValidCategoryId("Category Id");
    }
}