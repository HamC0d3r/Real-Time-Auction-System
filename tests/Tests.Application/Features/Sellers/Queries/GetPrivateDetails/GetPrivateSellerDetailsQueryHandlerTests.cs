using MazadZone.Application.Features.Sellers.Queries.GetPrivateDetails;
using MazadZone.Domain.Sellers; 

namespace Tests.Application.Features.Sellers.Queries.GetPrivateDetails;

public class GetPrivateSellerDetailsQueryHandlerTests : SellerBaseTest<GetPrivateSellerDetailsQueryHandler>
{
    [Fact]
    public async Task Handle_SellerDoesNotExist_ReturnsNotFoundError()
    {
        // Arrange
        var query = SellerHelper.CreateGetPrivateSellerDetailsQuery();

        // Simulate the Dapper query returning null
        _sellerQueries.GetPrivateProfileAsync(query.SellerId, Arg.Any<CancellationToken>())
            .Returns((PrivateSellerDetailsResponse?)null);

        // Act
        var result = await Handler.Handle(query, default);

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(SellerErrors.NotFound);
    }

    [Fact]
    public async Task Handle_SellerExists_ReturnsPrivateSellerDetails()
    {
        // Arrange
        var query = SellerHelper.CreateGetPrivateSellerDetailsQuery();
        
        // Create a fake DTO response that your read-model would typically return
        var expectedResponse = SellerHelper.CreatePrivateSellerDetailsResponse(query.SellerId);

        _sellerQueries.GetPrivateProfileAsync(query.SellerId, Arg.Any<CancellationToken>())
            .Returns(expectedResponse);

        // Act
        var result = await Handler.Handle(query, default);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.ShouldNotBeNull();
        
        // Verify the DTO properties map perfectly
        result.Value.SellerId.ShouldBe(expectedResponse.SellerId);
        result.Value.BankAccountNumber.ShouldBe(expectedResponse.BankAccountNumber);
        result.Value.TaxIdentificationNumber.ShouldBe(expectedResponse.TaxIdentificationNumber);
        result.Value.IsVerified.ShouldBe(expectedResponse.IsVerified);
        result.Value.Rating.ShouldBe(expectedResponse.Rating);
    }
}