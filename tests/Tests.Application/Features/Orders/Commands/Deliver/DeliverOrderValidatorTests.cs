using MazadZone.Application.Features.Orders.Commands.DeliverOrder;
using MazadZone.Domain.Orders;

namespace Tests.Application.Features.Orders.Commands.DeliverOrder;

public class DeliverOrderValidatorTests
{
    private readonly DeliverOrderValidator _validator;

    public DeliverOrderValidatorTests()
    {
        _validator = new DeliverOrderValidator();
    }

    [Fact]
    public void Validate_ValidCommand_PassesValidation()
    {
        // Arrange
        var command = OrderHelper.CreateDeliverOrderCommand();

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_OrderIdIsEmpty_FailsValidation()
    {
        // Arrange
        // Using the .Empty property that our extension now correctly invalidates
        var command = OrderHelper.CreateDeliverOrderCommand() with { OrderId = OrderId.Empty };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.OrderId);
    }
}