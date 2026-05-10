using MazadZone.Application.Features.Categories.Queries;
using MazadZone.Application.Features.Categories.Queries.GetCategoryStatistics;

namespace Tests.Application.Features.Categories.Queries.GetCategoryStatistics;

public class GetCategoryStatisticsHandlerTests : CategoryBaseTest<GetCategoryStatisticsQueryHandler>
{
    [Fact]
    public async Task Handle_Should_ReturnEmptyList_WhenNoDataExists()
    {
        // Arrange
        _categoryQueries.GetCategoryStatisticsAsync(Arg.Any<CancellationToken>())
            .Returns(new List<CategoryStatResponse>());

        var query = new GetCategoryStatisticsQuery();

        // Act
        var result = await Handler.Handle(query, default);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.ShouldBeEmpty();
    }

    [Fact]
    public async Task Handle_Should_ReturnStatistics_WhenDataIsPresent()
    {
        // Arrange
        var stats = new List<CategoryStatResponse>
        {
            new(Guid.NewGuid(), "Electronics",  12), // 150 auctions, 12 sub-categories
            new(Guid.NewGuid(), "Vehicles", 45)
        };

        _categoryQueries.GetCategoryStatisticsAsync(Arg.Any<CancellationToken>())
            .Returns(stats);

        var query = new GetCategoryStatisticsQuery();

        // Act
        var result = await Handler.Handle(query, default);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.Count.ShouldBe(2);
        result.Value.Any(x => x.Name == "Electronics").ShouldBeTrue();
    }
}