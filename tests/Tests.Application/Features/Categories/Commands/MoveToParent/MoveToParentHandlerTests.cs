using MazadZone.Application.Features.Categories.Commands.MoveToParent;
using MazadZone.Domain.Categories;
using MazadZone.Domain.Primitives.Results;

namespace Tests.Application.Features.Categories.MoveToParent;

public class MoveToParentHandlerTests : CategoryBaseTest<MoveToParentCommandHandler>
{
    private readonly ICategoryDomainService _domainService;

    public MoveToParentHandlerTests()
    {
        _domainService = Dependency<ICategoryDomainService>();
    }

    [Fact]
    public async Task Handle_Should_ReturnNotFound_WhenCategoryDoesNotExist()
    {
        // Arrange
        var categoryId = CategoryId.New();
        _categoryRepository.GetByIdAsync(categoryId.Value, Arg.Any<CancellationToken>())
            .Returns((Category?)null);

        var command = new MoveToParentCommand(categoryId, CategoryId.New());

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(CategoryErrors.NotFound);
    }

    [Fact]
    public async Task Handle_Should_ReturnFailure_WhenDomainServiceCheckFails()
    {
        // Arrange
        var category = Category.Create("Electronics", "Desc").Value;
        var newParentId = CategoryId.New();
        
        _categoryRepository.GetByIdAsync(category.Id.Value, Arg.Any<CancellationToken>()).Returns(category);
        
        // Mock the Service to simulate a Circular Reference failure
        _domainService.ChangeParentAsync(category, newParentId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure(CategoryErrors.CircularReference));

        var command = new MoveToParentCommand(category.Id, newParentId);

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(CategoryErrors.CircularReference);
    }

    [Fact]
    public async Task Handle_Should_Succeed_WhenMoveIsValid()
    {
        // Arrange
        var category = Category.Create("Laptops", "Desc").Value;
        var newParentId = CategoryId.New();
        
        _categoryRepository.GetByIdAsync(category.Id.Value, Arg.Any<CancellationToken>()).Returns(category);
        _domainService.ChangeParentAsync(category, newParentId, Arg.Any<CancellationToken>()).Returns(Result.Success());

        var command = new MoveToParentCommand(category.Id, newParentId);

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        category.ParentCategoryId.ShouldBe(newParentId); // Verify state change
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }
}