using MazadZone.Application.Features.Orders.Commands.DeliverOrder;
using MazadZone.Domain.Orders;

namespace Tests.Application.Features.Orders.Commands.DeliverOrder;

public class DeliverOrderValidatorTests
{
    private readonly DeliverOrderValidator _validator;

    public DeliverOrderValidatorTests()
    {
        // Arrange
        _validator = new DeliverOrderValidator();
    }

    [Fact]
    public void Should_Not_Have_Error_When_OrderId_IsValid()
    {
        // Arrange
        var command = new DeliverOrderCommand(OrderId.New());

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_Have_Error_When_OrderId_IsEmpty()
    {
        // Arrange
        // Using the .Empty property that our extension now correctly invalidates
        var command = new DeliverOrderCommand(OrderId.Empty);

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.OrderId);
    }
}