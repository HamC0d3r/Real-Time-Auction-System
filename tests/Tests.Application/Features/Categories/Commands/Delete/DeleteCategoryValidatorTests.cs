using FluentValidation.TestHelper;
using MazadZone.Application.Features.Categories.Commands.Delete;
using MazadZone.Domain.Categories;

namespace Tests.Application.Features.Categories.Delete;

public class DeleteCategoryValidatorTests
{
    private readonly DeleteCategoryCommandValidator _validator = new();

    [Fact]
    public void Should_Have_Error_When_CategoryId_Is_Empty()
    {
        // Assuming CategoryId.Empty or a Guid.Empty scenario
        var command = new DeleteCategoryCommand(CategoryId.Empty);
        
        var result = _validator.TestValidate(command);
        
        result.ShouldHaveValidationErrorFor(x => x.CategoryId);
    }
}