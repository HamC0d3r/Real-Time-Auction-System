using MazadZone.Application.Features.Orders.Commands.OpenDispute;
using MazadZone.Application.Orders.OpenDispute;
using MazadZone.Domain.Orders;

namespace Tests.Application.Orders.OpenDispute;

public class OpenDisputeValidatorTests
{
    private readonly OpenDisputeValidator _validator;

    public OpenDisputeValidatorTests()
    {
        // Arrange
        _validator = new OpenDisputeValidator();
    }

    // --- 1. SUCCESS SITUATION ---

    [Fact]
    public void Should_Not_Have_Any_Errors_When_Command_Is_Valid()
    {
        // Arrange
        var command = new OpenDisputeCommand(
            OrderId.New(), 
            "The item received is significantly different from the auction description.");

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    // --- 2. FAILURE SITUATIONS ---

    [Fact]
    public void Should_Have_Error_When_OrderId_Is_Empty()
    {
        // Arrange
        // Using OrderId.Empty which our MustBeValidOrderId correctly identifies as invalid
        var command = new OpenDisputeCommand(OrderId.Empty, "Valid reason here");

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.OrderId);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Should_Have_Error_When_Reason_Is_Null_Or_Whitespace(string invalidReason)
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
    public void Should_Have_Error_When_Reason_Is_Too_Short()
    {
        // Arrange 
        // Assuming your 'MustBeValidReason' requires a minimum length (e.g., 10 chars)
        var shortReason = "Too short"; 
        var command = new OpenDisputeCommand(OrderId.New(), shortReason);

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Reason);
    }
}