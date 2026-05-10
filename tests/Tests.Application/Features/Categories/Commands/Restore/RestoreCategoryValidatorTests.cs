using FluentValidation.TestHelper;
using MazadZone.Application.Features.Categories.Commands.Restore;
using MazadZone.Domain.Categories;

namespace Tests.Application.Features.Categories.Restore;

public class RestoreCategoryValidatorTests
{
    private readonly RestoreCategoryCommandValidator _validator = new();

    [Fact]
    public void Should_Have_Error_When_CategoryId_Is_Empty()
    {
        var command = new RestoreCategoryCommand(CategoryId.Empty);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.CategoryId);
    }

    [Fact]
    public void Should_Not_Have_Error_When_CategoryId_Is_Valid()
    {
        var command = new RestoreCategoryCommand(CategoryId.New());
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }
}