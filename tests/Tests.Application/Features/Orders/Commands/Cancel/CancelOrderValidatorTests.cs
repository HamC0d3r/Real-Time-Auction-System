using MazadZone.Application.Features.Orders.Commands.CancelOrder;
using MazadZone.Domain.Orders;

namespace Tests.Application.Features.Orders.Commands.CancelOrder;

public class CancelOrderValidatorTests
{
    private readonly CancelOrderValidator _validator;

    public CancelOrderValidatorTests()
    {
        _validator = new CancelOrderValidator();
    }

    [Fact]
    public void Validate_ValidCommand_PassesValidation()
    {
        // Arrange
        var command = new CancelOrderCommand(OrderId.New());

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_OrderIdIsEmpty_FailsValidation()
    {
        // Arrange
        var command = new CancelOrderCommand(OrderId.Empty);

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.OrderId);
    }
}