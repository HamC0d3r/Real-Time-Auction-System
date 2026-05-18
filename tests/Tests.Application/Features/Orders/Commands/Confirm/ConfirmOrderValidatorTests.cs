using MazadZone.Application.Features.Orders.Commands.Confirm;
using MazadZone.Domain.Orders;

namespace Tests.Application.Features.Orders.Commands.Confirm;

public class ConfirmOrderValidatorTests
{
    private readonly ConfirmOrderValidator _validator;

    public ConfirmOrderValidatorTests()
    {
        _validator = new ConfirmOrderValidator();
    }

    [Fact]
    public void Validate_ValidCommand_PassesValidation()
    {
        // Arrange
        var command = OrderHelper.CreateConfirmOrderCommand();

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_OrderIdIsEmpty_FailsValidation()
    {
        // Arrange
        var command = OrderHelper.CreateConfirmOrderCommand(OrderId.Empty);

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.OrderId);
    }
}