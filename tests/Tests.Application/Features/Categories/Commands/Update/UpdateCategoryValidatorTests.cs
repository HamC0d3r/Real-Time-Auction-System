using FluentValidation.TestHelper;
using MazadZone.Application.Features.Categories.Commands.Update;
using MazadZone.Domain.Categories;

namespace Tests.Application.Features.Categories.Update;

public class UpdateCategoryValidatorTests
{
    private readonly UpdateCategoryCommandValidator _validator = new();

    [Fact]
    public void Should_Have_Errors_When_Inputs_Are_Empty()
    {
        // Arrange
        var command = new UpdateCategoryCommand(CategoryId.Empty, "", "");

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.CategoryId);
        result.ShouldHaveValidationErrorFor(x => x.Name);
        result.ShouldHaveValidationErrorFor(x => x.Description);
    }
}