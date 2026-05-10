using MazadZone.Application.Features.Categories.Commands.Update;
using MazadZone.Domain.Categories;
using MazadZone.Domain.Shared.Errors;

namespace Tests.Application.Features.Categories.Update;

public class UpdateCategoryHandlerTests : CategoryBaseTest<UpdateCategoryCommandHandler>
{
    [Fact]
    public async Task Handle_Should_ReturnNotFound_WhenCategoryDoesNotExist()
    {
        // Arrange
        var categoryId = CategoryId.New();
        _categoryRepository.GetByIdAsync(categoryId.Value, Arg.Any<CancellationToken>())
            .Returns((Category?)null);

        var command = new UpdateCategoryCommand(categoryId, "New Name", "New Desc");

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(CategoryErrors.NotFound);
    }

    [Fact]
    public async Task Handle_Should_UpdateAndSave_WhenDataIsValid()
    {
        // Arrange
        var category = Category.Create("Old Name", "Old Desc").Value;
        var newName = "Updated Electronics";
        var newDesc = "Updated Description for electronics";

        _categoryRepository.GetByIdAsync(category.Id.Value, Arg.Any<CancellationToken>())
            .Returns(category);

        var command = new UpdateCategoryCommand(category.Id, newName, newDesc);

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        
        // Verify state change on the entity
        category.Name.Value.ShouldBe(newName);
        category.Description.Value.ShouldBe(newDesc);

        // Verify the Unit of Work was called
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_Should_ReturnFailure_WhenNameCreationFails()
    {
        // Arrange
        var category = Category.Create("Valid Name", "Valid Desc").Value;
        _categoryRepository.GetByIdAsync(category.Id.Value, Arg.Any<CancellationToken>())
            .Returns(category);

        // Assuming Name.Create fails on empty strings (even if Validator catches it, we test the Handler guard)
        var command = new UpdateCategoryCommand(category.Id, string.Empty, "Valid Description");

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsFailure.ShouldBeTrue();
        // We verify the error comes from the Name Value Object
        result.TopError.Code.ShouldBe(NameErrors.Empty.Code);
        await _unitOfWork.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_Should_ReturnFailure_WhenDescriptionCreationFails()
    {
        // Arrange
        var category = Category.Create("Valid Name", "Valid Desc").Value;
        _categoryRepository.GetByIdAsync(category.Id.Value, Arg.Any<CancellationToken>())
            .Returns(category);

        // Assuming Description.Create fails if the string is too long (e.g., > 500 chars)
        var longDescription = new string('A', 1000);
        var command = new UpdateCategoryCommand(category.Id, "Valid Name", longDescription);

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsFailure.ShouldBeTrue();
        // We verify the error comes from the Description Value Object
        result.TopError.Code.ShouldBe(DescriptionErrors.TooLong.Code);
        await _unitOfWork.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }
}