using MazadZone.Application.Features.Categories.Queries;
using MazadZone.Application.Features.Categories.Queries.GetBreadcrumbs;
using MazadZone.Domain.Categories;

namespace Tests.Application.Features.Categories.Queries.GetBreadcrumbs;

public class GetCategoryBreadcrumbsHandlerTests : CategoryBaseTest<GetCategoryBreadcrumbsQueryHandler>
{
    [Fact]
    public async Task Handle_Should_ReturnEmptyList_WhenCategoryIsNotFound()
    {
        // Arrange
        var categoryId = CategoryId.New();
        _categoryQueries.GetBreadcrumbsAsync(categoryId, Arg.Any<CancellationToken>())
            .Returns(new List<BreadcrumbResponse>()); // Or return null depending on your API design

        var query = new GetCategoryBreadcrumbsQuery(categoryId);

        // Act
        var result = await Handler.Handle(query, default);

        // Assert
        // Usually, breadcrumbs return an empty list or a 404. 
        // If your handler returns a 404:
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(CategoryErrors.NotFound);
    }

    [Fact]
    public async Task Handle_Should_ReturnOrderedBreadcrumbs_WhenCategoryExists()
    {
        // Arrange
        var categoryId = CategoryId.New();
        var breadcrumbs = new List<BreadcrumbResponse>
        {
            new(Guid.NewGuid(), "Electronics", 0),
            new(Guid.NewGuid(), "Laptops", 1),
            new(categoryId.Value, "Gaming Laptops", 2)
        };

        _categoryQueries.GetBreadcrumbsAsync(categoryId, Arg.Any<CancellationToken>())
            .Returns(breadcrumbs);

        var query = new GetCategoryBreadcrumbsQuery(categoryId);

        // Act
        var result = await Handler.Handle(query, default);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.Count.ShouldBe(3);
        result.Value.First().Name.ShouldBe("Electronics");
        result.Value.Last().Name.ShouldBe("Gaming Laptops");
    }
}