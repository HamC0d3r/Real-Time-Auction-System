using MazadZone.Application.Features.Categories.Commands.Delete;
using MazadZone.Domain.Categories;

namespace Tests.Application.Features.Categories.Delete;

public class DeleteCategoryHandlerTests : CategoryBaseTest<DeleteCategoryCommandHandler>
{
    [Fact]
    public async Task Handle_Should_ReturnNotFound_WhenCategoryDoesNotExist()
    {
        // Arrange
        var categoryId = CategoryId.New();
        _categoryRepository.GetByIdAsync(categoryId.Value, Arg.Any<CancellationToken>())
            .Returns((Category?)null);

        var command = new DeleteCategoryCommand(categoryId);

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(CategoryErrors.NotFound);
    }

    [Fact]
    public async Task Handle_Should_CallDeleteAndSave_WhenCategoryExists()
    {
        // Arrange
        var category = Category.Create("Electronics", "Desc").Value;
        _categoryRepository.GetByIdAsync(category.Id.Value, Arg.Any<CancellationToken>())
            .Returns(category);

        var command = new DeleteCategoryCommand(category.Id);

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        category.IsDeleted.ShouldBeTrue(); // Verify domain state changed
        
        // Verify changes were persisted
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }
}