using MazadZone.Application.Features.Sellers.Commands.UpdateBankDetails;
using MazadZone.Domain.Auctions;

namespace Tests.Application.Features.Sellers.Commands.UpdateBankDetails;

public class UpdateBankDetailsValidatorTests
{
    private readonly UpdateBankDetailsValidator _validator;

    public UpdateBankDetailsValidatorTests()
    {
        _validator = new UpdateBankDetailsValidator();
    }

    [Fact]
    public void Validate_ValidCommand_PassesValidation()
    {
        // Arrange
        var command = SellerHelper.CreateUpdateBankDetailsCommand();

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.IsValid.ShouldBeTrue();
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_SellerIdIsEmpty_FailsValidation()
    {
        // Arrange
        var command = SellerHelper.CreateUpdateBankDetailsCommand() with { SellerId = SellerId.Empty };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.IsValid.ShouldBeFalse();
        result.ShouldHaveValidationErrorFor(x => x.SellerId);

        // Ensure the bank account rule didn't cross-contaminate the failure results
        result.ShouldNotHaveValidationErrorFor(x => x.NewAccountNumber);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    // [InlineData("JO_INVALID_BANK_STRING_123")]
    public void Validate_NewAccountNumberIsInvalid_FailsValidation(string? invalidAccount)
    {
        // Arrange
        var command = SellerHelper.CreateUpdateBankDetailsCommand() with { NewAccountNumber = invalidAccount };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.IsValid.ShouldBeFalse();

        // Confirms your .MustBeValidBankAccount() extension blocks empty/malformed inputs early
        result.ShouldHaveValidationErrorFor(x => x.NewAccountNumber);
        result.ShouldNotHaveValidationErrorFor(x => x.SellerId);
    }

}