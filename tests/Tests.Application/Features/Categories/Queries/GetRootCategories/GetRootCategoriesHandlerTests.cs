using MazadZone.Application.Features.Categories.Queries.GetRootCategories;
using MazadZone.Application.Features.Categories.Queries;

namespace Tests.Application.Features.Categories.Queries.GetRootCategories;

public class GetRootCategoriesHandlerTests : CategoryBaseTest<GetRootCategoriesQueryHandler>
{
    [Fact]
    public async Task Handle_Should_ReturnEmptyList_WhenNoRootsExist()
    {
        // Arrange
        _categoryQueries.GetRootCategoriesAsync(Arg.Any<CancellationToken>())
            .Returns(new List<CategoryResponse>());

        var query = new GetRootCategoriesQuery();

        // Act
        var result = await Handler.Handle(query, default);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.ShouldBeEmpty();
    }

    [Fact]
    public async Task Handle_Should_ReturnRootCategories_WhenDataIsPresent()
    {
        // Arrange
        var rootCategories = new List<CategoryResponse>
        {
            new(Guid.NewGuid(), "Electronics", "Devices and Gadgets", null),
            new(Guid.NewGuid(), "Fashion", "Clothing and Accessories", null)
        };

        _categoryQueries.GetRootCategoriesAsync(Arg.Any<CancellationToken>())
            .Returns(rootCategories);

        var query = new GetRootCategoriesQuery();

        // Act
        var result = await Handler.Handle(query, default);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.Count.ShouldBe(2);
        
        // Use Shouldly to verify the specific content
        result.Value.ShouldContain(x => x.Name == "Electronics");
        result.Value.ShouldContain(x => x.Name == "Fashion");
        
        // Verify all returned categories are actually roots
        result.Value.All(x => x.ParentId == null).ShouldBeTrue();
    }
}