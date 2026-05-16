using MazadZone.Application.Features.Bidders.DTOs;
using MazadZone.Application.Features.Orders.Commands.Create;
using MazadZone.Domain.Auctions;

namespace Tests.Application.Features.Orders.Commands.Create;

public class CreateOrderValidatorTests
{
    private readonly CreateOrderValidator _validator;

    public CreateOrderValidatorTests()
    {
        // Arrange
        _validator = new CreateOrderValidator();
    }

    [Fact]
    public void Should_Not_Have_Error_When_Command_Is_Valid()
    {
        // Arrange
        var command = CreateValidCommand();

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_Have_Error_When_BidderId_Is_Empty()
    {
        // Arrange
        var command = CreateValidCommand() with { BidderId = BidderId.Empty };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.BidderId);
    }

    [Fact]
    public void Should_Have_Error_When_WinningBidId_Is_Empty()
    {
        // Arrange
        var command = CreateValidCommand() with { WinningBidId = BidId.Empty };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.WinningBidId);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-10)]
    public void Should_Have_Error_When_Amount_Is_Zero_Or_Less(decimal invalidAmount)
    {
        // Arrange
        var command = CreateValidCommand() with { Amount = invalidAmount };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Amount);
    }

    [Fact]
    public void Should_Have_Error_When_TransactionId_Is_Empty()
    {
        // Arrange
        var command = CreateValidCommand() with { DepositCaptureTransactionId = string.Empty };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.DepositCaptureTransactionId);
    }

    [Fact]
    public void Should_Have_Error_When_Address_Is_Invalid()
    {
        // Arrange
        // Creating an invalid address DTO (assuming ZipCode or City is required)
        var invalidAddress = new AddressDto(string.Empty, string.Empty, string.Empty, string.Empty);
        var command = CreateValidCommand() with { ReceiptAddress = invalidAddress };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        // This proves the Nested Validator (AddressDtoValidator) is being triggered
        result.ShouldHaveValidationErrorFor(x => x.ReceiptAddress.Street); 
        result.ShouldHaveValidationErrorFor(x => x.ReceiptAddress.City); 
        result.Errors.Any(x => x.PropertyName.Contains("ReceiptAddress")).ShouldBeTrue();
    }

    // --- Helper Methods ---

    private static CreateOrderCommand CreateValidCommand()
    {
        var validAddress = new AddressDto("Main St", "Amman", "11118", "Jordan");
        
        return new CreateOrderCommand(
            AuctionId.New(),
            BidderId.New(),
            BidId.New(),
            validAddress,
            100.00m,
            "txn_valid_123"
        );
    }
}