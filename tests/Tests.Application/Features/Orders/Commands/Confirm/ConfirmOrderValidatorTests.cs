using FluentValidation.TestHelper;
using MazadZone.Application.Features.Orders.Commands.Confirm;
using MazadZone.Domain.Orders;
using Shouldly;
using Xunit;

namespace Tests.Application.Features.Orders.Commands.Confirm;

public class ConfirmOrderValidatorTests
{
    private readonly ConfirmOrderValidator _validator;

    public ConfirmOrderValidatorTests()
    {
        // Arrange (Setup)
        _validator = new ConfirmOrderValidator();
    }

    [Fact]
    public void Should_Not_Have_Error_When_OrderId_IsValid()
    {
        // Arrange
        // Assuming OrderId.New() generates a valid, non-empty ID
        var command = new ConfirmOrderCommand(OrderId.New());

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_Have_Error_When_OrderId_IsEmpty()
    {
        // Arrange
        // Using the empty state that your MustBeValidOrderId() now correctly catches
        var command = new ConfirmOrderCommand(OrderId.Empty);

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.OrderId);
    }
}