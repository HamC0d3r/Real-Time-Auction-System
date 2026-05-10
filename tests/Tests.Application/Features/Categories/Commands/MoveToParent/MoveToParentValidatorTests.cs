using FluentValidation.TestHelper;
using MazadZone.Application.Features.Categories.Commands.MoveToParent;
using MazadZone.Domain.Categories;

namespace Tests.Application.Features.Categories.MoveToParent;

public class MoveToParentValidatorTests
{
    private readonly MoveToParentCommandValidator _validator = new();

    [Fact]
    public void Should_Have_Error_When_NewParentId_Is_Same_As_CategoryId()
    {
        // Arrange
        var sameId = CategoryId.New();
        var command = new MoveToParentCommand(sameId, sameId);

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.NewParentId)
              .WithErrorMessage("A category cannot be its own parent.");
    }
}