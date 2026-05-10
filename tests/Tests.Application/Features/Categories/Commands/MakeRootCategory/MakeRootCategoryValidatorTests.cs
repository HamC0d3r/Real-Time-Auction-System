using FluentValidation.TestHelper;
using MazadZone.Application.Features.Categories.Commands.MakeRootCategory;
using MazadZone.Domain.Categories;

namespace Tests.Application.Features.Categories.MakeRootCategory;

public class MakeRootCategoryValidatorTests
{
    private readonly MakeRootCategoryCommandValidator _validator = new();

    [Fact]
    public void Should_Have_Error_When_CategoryId_Is_Empty()
    {
        var command = new MakeRootCategoryCommand(CategoryId.Empty);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.CategoryId);
    }

    [Fact]
    public void Should_Not_Have_Error_When_CategoryId_Is_Valid()
    {
        var command = new MakeRootCategoryCommand(CategoryId.New());
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }
}