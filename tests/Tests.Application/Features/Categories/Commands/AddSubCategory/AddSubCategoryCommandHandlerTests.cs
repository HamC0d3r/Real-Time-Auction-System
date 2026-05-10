using MazadZone.Application.Features.Categories.Commands.AddSubCategory;
using MazadZone.Domain.Categories;

namespace Tests.Application.Features.Categories.AddSubCategory;

public class AddSubCategoryCommandHandlerTests : CategoryBaseTest<AddSubCategoryCommandHandler>
{

    [Fact]
    public async Task Handle_Should_ReturnNotFound_WhenParentDoesNotExist()
    {
        // Arrange: Parent returns null
        _categoryRepository.GetByIdAsync(Arg.Any<Guid>(), default).Returns((Category?)null);
        var command = new AddSubCategoryCommand(CategoryId.New(), CategoryId.New());

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(CategoryErrors.NotFound);
    }

    [Fact]
    public async Task Handle_Should_ReturnDomainError_WhenAddSubCategoryFails()
    {
        // Arrange: Both exist, but the domain logic fails (e.g., ParentId mismatch)
        var parent = Category.Create("Parent", "Desc").Value;
        var sub = Category.Create("Sub", "Desc", CategoryId.New()).Value; // ParentId is wrong

        _categoryRepository.GetByIdAsync(parent.Id.Value, default).Returns(parent);
        _categoryRepository.GetByIdAsync(sub.Id.Value, default).Returns(sub);

        var command = new AddSubCategoryCommand(parent.Id, sub.Id);

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsFailure.ShouldBeTrue();
        // Since sub.ParentId != parent.Id, parent.AddSubCategory(sub) returns InvalidParent
        result.TopError.Code.ShouldBe(CategoryErrors.InvalidParent.Code);
    }

    [Fact]
    public async Task Handle_Should_SaveAndReturnSuccess_WhenDataIsWithValid()
    {
        // Arrange
        var parent = Category.Create("Parent", "Desc").Value;
        var sub = Category.Create("Sub", "Desc", parent.Id).Value; // Correct ParentId

        _categoryRepository.GetByIdAsync(parent.Id.Value, default).Returns(parent);
        _categoryRepository.GetByIdAsync(sub.Id.Value, default).Returns(sub);

        var command = new AddSubCategoryCommand(parent.Id, sub.Id);

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        await _unitOfWork.Received(1).SaveChangesAsync(default); // Ensure DB was called
    }
}