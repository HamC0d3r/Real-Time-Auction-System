using FluentValidation.TestHelper;
using MazadZone.Application.Features.Categories.Commands.AddSubCategory;
using MazadZone.Domain.Categories;

namespace Tests.Application.Features.Categories.AddSubCategory;

public class AddSubCategoryCommandValidatorTests
{
    private readonly AddSubCategoryCommandValidator _validator = new();

    [Fact]
    public void Should_Have_Error_When_ParentId_And_SubCategoryId_Are_Same()
    {
        // Arrange
        var sameId = CategoryId.New();
        var command = new AddSubCategoryCommand(sameId, sameId);

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.SubCategoryId)
              .WithErrorMessage("Sub-category cannot be the same as the parent category.");
    }

    [Fact]
    public void Should_Not_Have_Error_When_Ids_Are_Different()
    {
        // Arrange
        var command = new AddSubCategoryCommand(CategoryId.New(), CategoryId.New());

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }
}