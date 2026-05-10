using MazadZone.Application.Features.Categories.Queries.GetSubCategories;
using MazadZone.Application.Features.Categories.Queries;
using MazadZone.Domain.Categories;

namespace Tests.Application.Features.Categories.Queries.GetSubCategories;

public class GetSubCategoriesHandlerTests : CategoryBaseTest<GetSubCategoriesQueryHandler>
{
    [Fact]
    public async Task Handle_Should_ReturnEmptyList_WhenNoSubCategoriesExist()
    {
        // Arrange
        var parentId = CategoryId.New();
        
        // Mocking the scenario where the query layer returns null
        _categoryQueries.GetSubCategoriesAsync(parentId, Arg.Any<CancellationToken>())
            .Returns((IReadOnlyList<CategoryResponse>?)null!);

        var query = new GetSubCategoriesQuery(parentId);

        // Act
        var result = await Handler.Handle(query, default);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.ShouldNotBeNull();
        result.Value.ShouldBeEmpty(); // Proves your ?? new List... logic works
    }

    [Fact]
    public async Task Handle_Should_ReturnList_WhenSubCategoriesExist()
    {
        // Arrange
        var parentId = CategoryId.New();
        var subCategories = new List<CategoryResponse>
        {
            new(Guid.NewGuid(), "Gaming Laptops", "High performance", parentId.Value),
            new(Guid.NewGuid(), "Business Laptops", "Professional use", parentId.Value)
        };

        _categoryQueries.GetSubCategoriesAsync(parentId, Arg.Any<CancellationToken>())
            .Returns(subCategories);

        var query = new GetSubCategoriesQuery(parentId);

        // Act
        var result = await Handler.Handle(query, default);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.Count.ShouldBe(2);
        result.Value.All(x => x.ParentId == parentId.Value).ShouldBeTrue();
    }
}