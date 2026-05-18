using MazadZone.Application.Features.Bidders.DTOs;
using MazadZone.Application.Features.Orders.Commands.Create;
using MazadZone.Domain.Auctions;

namespace Tests.Application.Features.Orders.Commands.Create;

public class CreateOrderValidatorTests
{
    private readonly CreateOrderValidator _validator;

    public CreateOrderValidatorTests()
    {
        _validator = new CreateOrderValidator();
    }

    [Fact]
    public void Validate_ValidCommand_PassesValidation()
    {
        // Arrange
        var command = OrderHelper.CreateOrderCommand();

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_BidderIdIsEmpty_FailsValidation()
    {
        // Arrange
        var command = OrderHelper.CreateOrderCommand() with { BidderId = BidderId.Empty };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.BidderId);
    }

    [Fact]
    public void Validate_WinningBidIdIsEmpty_FailsValidation()
    {
        // Arrange
        var command = OrderHelper.CreateOrderCommand() with { WinningBidId = BidId.Empty };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.WinningBidId);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-10)]
    public void Validate_AmountIsZeroOrLess_FailsValidation(decimal invalidAmount)
    {
        // Arrange
        var command = OrderHelper.CreateOrderCommand() with {Amount = invalidAmount};

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Amount);
    }

    [Fact]
    public void Validate_TransactionIdIsEmpty_FailsValidation()
    {
        // Arrange
        var command = OrderHelper.CreateOrderCommand() with { DepositCaptureTransactionId = string.Empty };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.DepositCaptureTransactionId);
    }

    [Fact]
    public void Validate_AddressIsInvalid_FailsValidation()
    {
        // Arrange
        // Creating an invalid address DTO (assuming ZipCode or City is required)
        var invalidAddress = new AddressDto(string.Empty, string.Empty, string.Empty, string.Empty);
        var command = OrderHelper.CreateOrderCommand() with { ReceiptAddress = invalidAddress };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        // This proves the Nested Validator (AddressDtoValidator) is being triggered
        result.ShouldHaveValidationErrorFor(x => x.ReceiptAddress.Street); 
        result.ShouldHaveValidationErrorFor(x => x.ReceiptAddress.City); 
        result.Errors.Any(x => x.PropertyName.Contains("ReceiptAddress")).ShouldBeTrue();
    }
}