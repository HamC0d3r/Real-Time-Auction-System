using MazadZone.Application.Features.Categories.Commands.Create;
using MazadZone.Domain.Categories;
using MazadZone.Domain.Primitives.Results;

namespace Tests.Application.Features.Categories.Create;

public class CreateCategoryHandlerTests : CategoryBaseTest<CreateCategoryCommandHandler>
{
    private readonly ICategoryDomainService _domainService;

    public CreateCategoryHandlerTests()
    {
        // We grab the domain service mock from the AutoMocker
        _domainService = Dependency<ICategoryDomainService>();
    }

    [Fact]
    public async Task Handle_Should_ReturnError_WhenParentDoesNotExist()
    {
        // Arrange
        var parentId = CategoryId.New();
        var command = new CreateCategoryCommand("Laptops", "Desc", parentId);

        // Mock the service to return a failure
        _domainService.ValidateParentExistsAsync(parentId, Arg.Any<CancellationToken>())
            .Returns(Result.Failure(CategoryErrors.NotFound));

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(CategoryErrors.NotFound);
    }

    [Fact]
    public async Task Handle_Should_ReturnConflict_WhenNameIsNotUnique()
    {
        // Arrange
        var command = new CreateCategoryCommand("Electronics", "Desc", null);

        // Parent check passes
        _domainService.ValidateParentExistsAsync(null, Arg.Any<CancellationToken>())
            .Returns(Result.Success());
        
        // Uniqueness check fails
        _domainService.IsNameUniqueInScopeAsync("Electronics", null, null, Arg.Any<CancellationToken>())
            .Returns(Result.Failure(CategoryErrors.AlreadyExists));

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(CategoryErrors.AlreadyExists);
    }

    [Fact]
    public async Task Handle_Should_AddCategoryAndSave_WhenRequestIsValid()
    {
        // Arrange
        var command = new CreateCategoryCommand("Books", "Description", null);

        _domainService.ValidateParentExistsAsync(null, Arg.Any<CancellationToken>())
            .Returns(Result.Success());
        
        _domainService.IsNameUniqueInScopeAsync("Books", null, null, Arg.Any<CancellationToken>())
            .Returns(Result.Success());

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        
        // Verify the Aggregate was added to the repository
        _categoryRepository.Received(1).Add(Arg.Is<Category>(c => c.Name.Value == "Books"));
        
        // Verify changes were saved via the Global UnitOfWork
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }
}