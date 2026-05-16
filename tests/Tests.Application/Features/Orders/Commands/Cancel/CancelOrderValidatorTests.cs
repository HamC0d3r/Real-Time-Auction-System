using FluentValidation.TestHelper;
using MazadZone.Application.Features.Orders.Commands.CancelOrder;
using MazadZone.Domain.Orders;

namespace Tests.Application.Features.Orders.Commands.CancelOrder;

public class CancelOrderValidatorTests
{
    private readonly CancelOrderValidator _validator;

    public CancelOrderValidatorTests()
    {
        // Arrange (Setup)
        _validator = new CancelOrderValidator();
    }

    [Fact]
    public void Should_Not_Have_Error_When_OrderId_IsValid()
    {
        // Arrange
        var command = new CancelOrderCommand(OrderId.New());

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_Have_Error_When_OrderId_IsEmpty()
    {
        // Arrange
        // Assuming MustBeValidOrderId() rejects Guid.Empty
        var command = new CancelOrderCommand(OrderId.Empty);

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.OrderId);
        
        // Note: If MustBeValidOrderId() sets a specific custom error message, 
        // you can optionally chain .WithErrorMessage("Your expected message here")
    }
}