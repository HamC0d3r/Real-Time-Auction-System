using MazadZone.Application.Features.Categories.Queries;
using MazadZone.Application.Features.Categories.Queries.GetCategoryTree;

namespace Tests.Application.Features.Categories.Queries.GetCategoryTree;

public class GetCategoryTreeHandlerTests : CategoryBaseTest<GetCategoryTreeQueryHandler>
{
    [Fact]
    public async Task Handle_Should_ReturnEmptyList_WhenNoCategoriesExist()
    {
        // Arrange
        _categoryQueries.GetTreeAsync(Arg.Any<CancellationToken>())
            .Returns(new List<CategoryTreeResponse>());

        var query = new GetCategoryTreeQuery();

        // Act
        var result = await Handler.Handle(query, default);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.ShouldBeEmpty();
    }

    [Fact]
public async Task Handle_Should_ReturnNestedTree_WhenDataIsPresent()
{
    // 1. Setup IDs so we can link them properly
    var parentId = Guid.NewGuid();
    var childId = Guid.NewGuid();

    // 2. Fix Constructor: You missed the 'ParentId' argument in your record
    var laptopNode = new CategoryTreeResponse(
        childId, 
        "Laptops", 
        "Laptops Description", 
        parentId, // Added ParentId
        new List<CategoryTreeResponse>());

    var electronicsNode = new CategoryTreeResponse(
        parentId, 
        "Electronics", 
        "Electronics Description", 
        null, // Root has no parent
        new List<CategoryTreeResponse> { laptopNode });

    var tree = new List<CategoryTreeResponse> { electronicsNode };

    _categoryQueries.GetTreeAsync(Arg.Any<CancellationToken>())
        .Returns(tree);

    var query = new GetCategoryTreeQuery();

    // Act
    var result = await Handler.Handle(query, default);

    // Assert
    result.IsSuccess.ShouldBeTrue();
    result.Value.Count.ShouldBe(1);
    
    // 3. Fix Indexing: Access the first element of the list before checking properties
    result.Value[0].Name.ShouldBe("Electronics");
    result.Value[0].Children.Count.ShouldBe(1);
    
    // 4. Fix Indexing: Drill down into the children
    result.Value[0].Children[0].Name.ShouldBe("Laptops");
}
}