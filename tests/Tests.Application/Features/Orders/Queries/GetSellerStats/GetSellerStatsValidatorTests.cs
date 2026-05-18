using MazadZone.Application.Features.Orders.Queries.GetSellerStats;
using MazadZone.Domain.Auctions;

namespace Tests.Application.Features.Orders.Queries.GetSellerStats;

public class GetSellerStatsValidatorTests
{
    private readonly GetSellerStatsValidator _validator;

    public GetSellerStatsValidatorTests()
    {
        _validator = new GetSellerStatsValidator();
    }

    [Fact]
    public void Validate_ValidQuery_PassesValidation()
    {
        // Arrange - Create a query with a properly initialized SellerId
        var query = new GetSellerStatsQuery(SellerId.New());

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.SellerId);
    }

    [Fact]
    public void Validate_SellerIdIsEmpty_FailsValidation()
    {
        // Arrange
        var query = new GetSellerStatsQuery(SellerId.Empty);

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.SellerId);
    }
}