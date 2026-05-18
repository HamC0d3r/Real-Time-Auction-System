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
    public void Validate_ValidQuery_PassesValidation()
    {
        // Arrange - Create a valid BidId using the Vogen-generated New() method
        var query = OrderHelper.CreateGetOrderByWinningBidQuery();

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.WinningBidId);
    }

    [Fact]
    public void Validate_WinningBidIdIsEmpty_FailsValidation()
    {
        // Arrange
        var query = OrderHelper.CreateGetOrderByWinningBidQuery() with {WinningBidId = BidId.Empty};

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.WinningBidId);
    }
}