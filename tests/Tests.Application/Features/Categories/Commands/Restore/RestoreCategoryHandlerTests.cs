using MazadZone.Application.Features.Categories.Commands.Restore;
using MazadZone.Domain.Categories;
using MazadZone.Domain.Shared.ValueObjects;

namespace Tests.Application.Features.Categories.Restore;

public class RestoreCategoryHandlerTests : CategoryBaseTest<RestoreCategoryCommandHandler>
{
    [Fact]
    public async Task Handle_Should_ReturnNotFound_WhenCategoryDoesNotExist()
    {
        // Arrange
        var categoryId = CategoryId.New();
        _categoryRepository.GetByIdAsync(categoryId.Value, Arg.Any<CancellationToken>())
            .Returns((Category?)null);

        var command = new RestoreCategoryCommand(categoryId);

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(CategoryErrors.NotFound);
    }

    [Fact]
    public async Task Handle_Should_RestoreAndSave_WhenCategoryExists()
    {
        // Arrange
        // We create a category and manually "delete" it first
        var category = Category.Create("Collectibles", "Vintage items").Value;
        category.Delete(); 
        category.IsDeleted.ShouldBeTrue(); // Sanity check

        _categoryRepository.GetByIdAsync(category.Id.Value, Arg.Any<CancellationToken>())
            .Returns(category);

        var command = new RestoreCategoryCommand(category.Id);

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        category.IsDeleted.ShouldBeFalse(); // The Domain state change
        
        // Verify changes were persisted
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }
}