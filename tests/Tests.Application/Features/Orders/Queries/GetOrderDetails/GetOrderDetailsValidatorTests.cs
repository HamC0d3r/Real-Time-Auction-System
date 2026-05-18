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
    public void Validate_ValidQuery_PassesValidation()
    {
        // Arrange - Create a query with a valid, non-default OrderId
        var query = new GetOrderDetailsQuery(OrderId.New());

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.OrderId);
    }

    [Fact]
    public void Validate_OrderIdIsEmpty_FailsValidation()
    {
        // Arrange
        var query = new GetOrderDetailsQuery(OrderId.Empty);

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.OrderId);
    }
}