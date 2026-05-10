using MazadZone.Application.Features.Categories.Queries;
using MazadZone.Application.Features.Categories.Queries.GetById;
using MazadZone.Domain.Categories;

namespace Tests.Application.Features.Categories.Queries.GetById;

public class GetCategoryByIdHandlerTests : CategoryBaseTest<GetCategoryByIdQueryHandler>
{
    [Fact]
    public async Task Handle_Should_ReturnNotFound_WhenCategoryDoesNotExist()
    {
        // Arrange
        var categoryId = CategoryId.New();
        _categoryQueries.GetByIdAsync(categoryId, Arg.Any<CancellationToken>())
            .Returns((CategoryResponse?)null);

        var query = new GetCategoryByIdQuery(categoryId);

        // Act
        var result = await Handler.Handle(query, default);

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(CategoryErrors.NotFound);
    }

    [Fact]
    public async Task Handle_Should_ReturnSuccess_WhenCategoryExists()
    {
        // Arrange
        var categoryId = CategoryId.New();
        var response = new CategoryResponse(
            categoryId.Value,
            "Electronics",
            "All electronic gadgets",
            null);

        _categoryQueries.GetByIdAsync(categoryId, Arg.Any<CancellationToken>())
            .Returns(response);

        var query = new GetCategoryByIdQuery(categoryId);

        // Act
        var result = await Handler.Handle(query, default);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.ShouldBe(response);
        result.Value.Name.ShouldBe("Electronics");
    }


}