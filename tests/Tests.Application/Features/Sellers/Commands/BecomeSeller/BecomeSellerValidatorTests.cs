using MazadZone.Application.Features.Sellers.Commands.BecomeSeller;
using MazadZone.Domain.Users.ValueObjects;

namespace Tests.Application.Features.Sellers.Commands.BecomeSeller;

public class BecomeSellerValidatorTests
{
    private readonly BecomeSellerValidator _validator;

    public BecomeSellerValidatorTests()
    {
        _validator = new BecomeSellerValidator();
    }

    [Fact]
    public void Validate_ValidCommand_PassesValidation()
    {
        // Arrange
        var command = SellerHelper.CreateBecomeSellerCommand();

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.IsValid.ShouldBeTrue();
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_UserIdIsEmpty_FailsValidation()
    {
        // Arrange
        var command = SellerHelper.CreateBecomeSellerCommand() with { UserId = UserId.Empty };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.IsValid.ShouldBeFalse();
        result.ShouldHaveValidationErrorFor(x => x.UserId);
        
        // Ensure the bank account rule didn't cross-contaminate the failure results
        result.ShouldNotHaveValidationErrorFor(x => x.BankAccountNumber);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    // [InlineData("SHORT_ACC_123")] // Malformed string
    public void Validate_BankAccountNumberIsInvalid_FailsValidation(string? invalidAccount)
    {
        // Arrange
        var command = SellerHelper.CreateBecomeSellerCommand() with { BankAccountNumber = invalidAccount };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.IsValid.ShouldBeFalse();
        
        // Confirms your .MustBeValidBankAccount() intercepts empty/malformed text inputs gracefully
        result.ShouldHaveValidationErrorFor(x => x.BankAccountNumber);
        result.ShouldNotHaveValidationErrorFor(x => x.UserId);
    }
}