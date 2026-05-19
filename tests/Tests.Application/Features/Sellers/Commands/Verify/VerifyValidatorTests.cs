using MazadZone.Application.Features.Sellers.Commands.Verify;
using MazadZone.Domain.Auctions;

namespace Tests.Application.Features.Sellers.Commands.Verify;

public class VerifyValidatorTests
{
    private readonly VerifyValidator _validator;

    public VerifyValidatorTests()
    {
        _validator = new VerifyValidator();
    }

    [Fact]
    public void Validate_ValidCommand_PassesValidation()
    {
        // Arrange
        var command = SellerHelper.CreateVerifyCommand();

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
        // Passing an empty Guid to trigger the failure condition in your custom extension
        var command = SellerHelper.CreateVerifyCommand() with { SellerId = SellerId.Empty };

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.IsValid.ShouldBeFalse();
        
        // Verifies that your MustBeValidSellerId() extension caught the bad input
        result.ShouldHaveValidationErrorFor(x => x.SellerId);
    }
}