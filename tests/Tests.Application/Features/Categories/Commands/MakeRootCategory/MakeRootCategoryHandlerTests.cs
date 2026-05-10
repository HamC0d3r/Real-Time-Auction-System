using MazadZone.Application.Features.Categories.Commands.MakeRootCategory;
using MazadZone.Domain.Categories;

namespace Tests.Application.Features.Categories.MakeRootCategory;

public class MakeRootCategoryHandlerTests : CategoryBaseTest<MakeRootCategoryCommandHandler>
{
    [Fact]
    public async Task Handle_Should_ReturnNotFound_WhenCategoryDoesNotExist()
    {
        // Arrange
        var categoryId = CategoryId.New();
        _categoryRepository.GetByIdAsync(categoryId.Value, Arg.Any<CancellationToken>())
            .Returns((Category?)null);

        var command = new MakeRootCategoryCommand(categoryId);

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(CategoryErrors.NotFound);
    }

    [Fact]
    public async Task Handle_Should_PromoteToRoot_WhenCategoryExists()
    {
        // Arrange
        var parentId = CategoryId.New();
        var category = Category.Create("SubCategory", "Description", parentId).Value;
        
        // Sanity check: Ensure it actually has a parent before we start
        category.ParentCategoryId.ShouldNotBeNull();

        _categoryRepository.GetByIdAsync(category.Id.Value, Arg.Any<CancellationToken>())
            .Returns(category);

        var command = new MakeRootCategoryCommand(category.Id);

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        category.ParentCategoryId.ShouldBeNull(); // The Domain Logic was executed
        
        // Verify changes were persisted
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }
}