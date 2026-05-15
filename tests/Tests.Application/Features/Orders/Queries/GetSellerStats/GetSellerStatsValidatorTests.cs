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
    public void Should_Not_Have_Error_When_SellerId_Is_Valid()
    {
        // Arrange - Create a query with a properly initialized SellerId
        var query = new GetSellerStatsQuery(SellerId.New());

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.SellerId);
    }

    [Fact]
    public void Should_Have_Error_When_SellerId_Is_Empty()
    {
        // Arrange
        var query = new GetSellerStatsQuery(SellerId.Empty);

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.SellerId);
    }
}