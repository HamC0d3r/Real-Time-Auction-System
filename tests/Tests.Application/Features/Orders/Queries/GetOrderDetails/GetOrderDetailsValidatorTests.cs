using MazadZone.Application.Features.Orders.Queries.GetOrderDetails;
using MazadZone.Domain.Orders;

namespace Tests.Application.Features.Orders.Queries.GetOrderDetails;

public class GetOrderDetailsValidatorTests
{
    private readonly GetOrderDetailsValidator _validator;

    public GetOrderDetailsValidatorTests()
    {
        _validator = new GetOrderDetailsValidator();
    }

    [Fact]
    public void Should_Not_Have_Error_When_OrderId_Is_Valid()
    {
        // Arrange - Create a query with a valid, non-default OrderId
        var query = new GetOrderDetailsQuery(OrderId.New());

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.OrderId);
    }

    [Fact]
    public void Should_Have_Error_When_OrderId_Is_Empty()
    {
        // Arrange
        var query = new GetOrderDetailsQuery(OrderId.Empty);

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.OrderId);
    }
}