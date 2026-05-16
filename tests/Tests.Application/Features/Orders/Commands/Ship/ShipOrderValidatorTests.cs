using MazadZone.Application.Features.Orders.Commands.ShipOrder;
using MazadZone.Domain.Orders;

namespace Tests.Application.Features.Orders.Commands.ShipOrder;

public class ShipOrderValidatorTests
{
    private readonly ShipOrderValidator _validator;

    public ShipOrderValidatorTests()
    {
        _validator = new ShipOrderValidator();
    }

    [Fact]
    public void Should_Not_Have_Error_When_OrderId_Is_Valid()
    {
        // Arrange
        var command = new ShipOrderCommand(OrderId.New());

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.OrderId);
    }

    [Fact]
    public void Should_Have_Error_When_OrderId_Is_Empty()
    {
        // Arrange
        var command = new ShipOrderCommand(OrderId.Empty);

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.OrderId);
    }
}