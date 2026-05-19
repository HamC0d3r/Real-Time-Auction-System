using MazadZone.Application.Features.Sellers.Queries.GetUnverifiedSellers;

namespace Tests.Application.Features.Sellers.Queries.GetUnverifiedSellers;

public class GetUnverifiedSellersQueryHandlerTests : SellerBaseTest<GetUnverifiedSellersQueryHandler>
{
    [Fact]
    public async Task Handle_UnverifiedSellersExist_ReturnsPopulatedList()
    {
        // Arrange
        var query = new GetUnverifiedSellersQuery();
        
        // Create a fake list of unverified sellers 
        var expectedSellers = SellerHelper.CreateUnverifiedSellerSummaries();

        _sellerQueries.GetUnverifiedSellersAsync(Arg.Any<CancellationToken>())
            .Returns(expectedSellers);

        // Act
        var result = await Handler.Handle(query, default);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.ShouldNotBeNull();
        result.Value.Count.ShouldBe(expectedSellers.Count);
        
        // Shouldly will do a deep structural comparison of the records
        result.Value.ShouldBe(expectedSellers); 
    }

    [Fact]
    public async Task Handle_QueryServiceReturnsNull_ReturnsEmptyList()
    {
        // Arrange
        var query = new GetUnverifiedSellersQuery();

        _sellerQueries.GetUnverifiedSellersAsync(Arg.Any<CancellationToken>())
            .Returns((IReadOnlyList<UnverifiedSellerSummaryResponse>?)null);

        // Act
        var result = await Handler.Handle(query, default);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        
        // ✅ Verify the null-coalescing operator successfully caught the null and returned an empty list
        result.Value.ShouldNotBeNull();
        result.Value.ShouldBeEmpty();
    }

    [Fact]
    public async Task Handle_QueryServiceReturnsEmptyList_ReturnsEmptyList()
    {
        // Arrange
        var query = new GetUnverifiedSellersQuery();

        // Simulate the DB returning an explicitly empty list
        _sellerQueries.GetUnverifiedSellersAsync(Arg.Any<CancellationToken>())
            .Returns(new List<UnverifiedSellerSummaryResponse>());

        // Act
        var result = await Handler.Handle(query, default);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.ShouldNotBeNull();
        result.Value.ShouldBeEmpty();
    }
}