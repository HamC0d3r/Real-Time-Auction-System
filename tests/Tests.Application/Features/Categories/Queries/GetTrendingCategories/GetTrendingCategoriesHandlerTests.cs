using MazadZone.Application.Features.Categories.Queries.GetTrendingCategories;
using MazadZone.Application.Features.Categories.Queries;

namespace Tests.Application.Features.Categories.Queries.GetTrendingCategories;

public class GetTrendingCategoriesHandlerTests : CategoryBaseTest<GetTrendingCategoriesQueryHandler>
{
    [Fact]
    public async Task Handle_Should_ReturnTrendingCategories_WhenDataIsPresent()
    {
        // Arrange
        var limit = 5;
        var trendingData = new List<TrendingCategoryResponse>
        {
            new(Guid.NewGuid(), "Vintage Watches", 450), // Id, Name, ActivityCount, TrendScore
            new(Guid.NewGuid(), "Sports Cars", 300)
        };

        // Applying the Senior fix for CS8620: Cast to the expected Task type
        _categoryQueries.GetTrendingCategoriesAsync(limit, Arg.Any<CancellationToken>())
            .Returns((IReadOnlyList<TrendingCategoryResponse>)trendingData);

        var query = new GetTrendingCategoriesQuery(limit);

        // Act
        var result = await Handler.Handle(query, default);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.Count.ShouldBe(2);
        result.Value[0].Name.ShouldBe("Vintage Watches");
        result.Value[1].Name.ShouldBe("Sports Cars");

        // Verify we passed the limit correctly to the query layer
        await _categoryQueries.Received(1).GetTrendingCategoriesAsync(limit, Arg.Any<CancellationToken>());
    }
}