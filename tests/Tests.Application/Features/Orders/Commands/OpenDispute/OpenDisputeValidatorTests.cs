using MazadZone.Application.Features.Orders.Commands.OpenDispute;
using MazadZone.Application.Orders.OpenDispute;
using MazadZone.Domain.Orders;
using Tests.Application.Features.Orders;

namespace Tests.Application.Orders.OpenDispute;

public class OpenDisputeValidatorTests
{
    private readonly OpenDisputeValidator _validator;

    public OpenDisputeValidatorTests()
    {
        _validator = new OpenDisputeValidator();
    }

    [Fact]
    public void Validate_ValidCommand_PassesValidation()
    {
        // Arrange
        var command = OrderHelper.CreateOpenDisputeCommand();

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_OrderIdIsEmpty_FailsValidation()
    {
        // Arrange
        var command = OrderHelper.CreateOpenDisputeCommand() with { OrderId = OrderId.Empty };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.OrderId);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Validate_ReasonIsNullOrWhitespace_FailsValidation(string invalidReason)
    {
        // Arrange
        var command = new OpenDisputeCommand(OrderId.New(), invalidReason);

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        // This proves MustBeValidReason() is catching empty input
        result.ShouldHaveValidationErrorFor(x => x.Reason);
    }

    [Fact]
    public void Validate_ReasonIsTooShort_FailsValidation()
    {
        // Arrange 
        // Assuming your 'MustBeValidReason' requires a minimum length (e.g., 10 chars)
        var shortReason = "Too short";
        var command = OrderHelper.CreateOpenDisputeCommand() with { Reason = shortReason };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Reason);
    }
}