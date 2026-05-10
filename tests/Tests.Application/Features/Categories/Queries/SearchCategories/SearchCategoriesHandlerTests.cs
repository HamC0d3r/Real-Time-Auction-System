using MazadZone.Application.Features.Categories.Queries.SearchCategories;
using MazadZone.Application.Features.Categories.Queries;

namespace Tests.Application.Features.Categories.Queries.SearchCategories;

public class SearchCategoriesHandlerTests : CategoryBaseTest<SearchCategoriesQueryHandler>
{
    [Fact]
    public async Task Handle_Should_ReturnResults_WhenMatchesFound()
    {
        // Arrange
        var term = "Elect";
        var searchResults = new List<CategoryResponse>
        {
            new(Guid.NewGuid(), "Electronics", "Devices", null),
            new(Guid.NewGuid(), "Electric Tools", "Hardware", null)
        };

        // Explicit cast to satisfy CS8620
        _categoryQueries.SearchByNameAsync(term, Arg.Any<CancellationToken>())
            .Returns((IReadOnlyList<CategoryResponse>)searchResults);

        var query = new SearchCategoriesQuery(term);

        // Act
        var result = await Handler.Handle(query, default);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.Count.ShouldBe(2);
        result.Value.ShouldContain(x => x.Name.Contains("Elect"));
    }

    [Fact]
    public async Task Handle_Should_ReturnEmptyList_WhenNoMatchesFound()
    {
        // Arrange
        var term = "Unknown";
        _categoryQueries.SearchByNameAsync(term, Arg.Any<CancellationToken>())
            .Returns((IReadOnlyList<CategoryResponse>?)null!);

        var query = new SearchCategoriesQuery(term);

        // Act
        var result = await Handler.Handle(query, default);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.ShouldNotBeNull();
        result.Value.ShouldBeEmpty();
    }
}