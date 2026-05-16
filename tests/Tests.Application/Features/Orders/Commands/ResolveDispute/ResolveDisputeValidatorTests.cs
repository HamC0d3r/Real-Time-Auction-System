using MazadZone.Application.Features.Orders.Commands.ResolveDispute;
using MazadZone.Application.Orders.ResolveDispute;
using MazadZone.Domain.Orders;

namespace Tests.Application.Features.Orders.Commands.ResolveDispute;

public class ResolveDisputeValidatorTests
{
    private readonly ResolveDisputeValidator _validator;

    public ResolveDisputeValidatorTests()
    {
        _validator = new ResolveDisputeValidator();
    }

    [Fact]
    public void Should_Not_Have_Error_When_Command_Is_Valid()
    {
        // Arrange
        var command = new ResolveDisputeCommand(
            OrderId.New(), 
            "Full refund issued to bidder due to item damage.");

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_Have_Error_When_OrderId_Is_Empty()
    {
        // Arrange
        var command = new ResolveDisputeCommand(OrderId.Empty, "Valid resolution");

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.OrderId);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Should_Have_Error_When_Resolution_Is_Invalid(string invalidResolution)
    {
        // Arrange
        var command = new ResolveDisputeCommand(OrderId.New(), invalidResolution);

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Resolution);
    }

    [Fact]
    public void Should_Have_Error_When_Resolution_Is_Too_Short()
    {
        // Arrange
        // Assuming MustBeValidResolution requires a minimum length (e.g., 10-20 chars)
        var command = new ResolveDisputeCommand(OrderId.New(), "Too short");

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Resolution);
    }
}