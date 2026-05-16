using MazadZone.Application.Features.Orders.Queries.GetOrderByWinningBid;
using MazadZone.Domain.Auctions;

namespace Tests.Application.Features.Orders.Queries.GetOrderByWinningBid;

public class GetOrderByWinningBidValidatorTests
{
    private readonly GetOrderByWinningBidValidator _validator;

    public GetOrderByWinningBidValidatorTests()
    {
        _validator = new GetOrderByWinningBidValidator();
    }

    [Fact]
    public void Should_Not_Have_Error_When_WinningBidId_Is_Valid()
    {
        // Arrange - Create a valid BidId using the Vogen-generated New() method
        var query = new GetOrderByWinningBidQuery(BidId.New());

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.WinningBidId);
    }

    [Fact]
    public void Should_Have_Error_When_WinningBidId_Is_Empty()
    {
        // Arrange
        var query = new GetOrderByWinningBidQuery(BidId.Empty);

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.WinningBidId);
    }
}