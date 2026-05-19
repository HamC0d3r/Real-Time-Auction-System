using MazadZone.Application.Features.Sellers.Queries.GetPublicProfile;
using MazadZone.Domain.Sellers; 

namespace Tests.Application.Features.Sellers.Queries.GetPublicProfile;

public class GetPublicSellerProfileQueryHandlerTests : SellerBaseTest<GetPublicSellerProfileQueryHandler>
{
    [Fact]
    public async Task Handle_SellerDoesNotExist_ReturnsNotFoundError()
    {
        // Arrange
        var query = SellerHelper.CreateGetPublicSellerProfileQuery(); 

        // Simulate the Dapper query returning null
        _sellerQueries.GetPublicProfileAsync(query.SellerId, Arg.Any<CancellationToken>())
            .Returns((PublicSellerProfileResponse?)null);

        // Act
        var result = await Handler.Handle(query, default);

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(SellerErrors.NotFound);
    }

    [Fact]
    public async Task Handle_SellerExists_ReturnsPublicSellerProfile()
    {
        // Arrange
        var query = SellerHelper.CreateGetPublicSellerProfileQuery();

        // Create a fake DTO response containing ONLY public-facing data
        var expectedResponse = SellerHelper.CreatePublicSellerProfileResponse() with { SellerId = query.SellerId };

        _sellerQueries.GetPublicProfileAsync(query.SellerId, Arg.Any<CancellationToken>())
            .Returns(expectedResponse);

        // Act
        var result = await Handler.Handle(query, default);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.ShouldNotBeNull();
        
        // Verify the DTO mapped perfectly back to the client
        result.Value.SellerId.ShouldBe(expectedResponse.SellerId);
        result.Value.IsVerified.ShouldBe(expectedResponse.IsVerified);
        result.Value.Rating.ShouldBe(expectedResponse.Rating);
        result.Value.ReviewsCount.ShouldBe(expectedResponse.ReviewsCount);
        result.Value.JoinedOnUtc.ShouldBe(expectedResponse.JoinedOnUtc);
    }
}