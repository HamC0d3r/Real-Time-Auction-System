using MazadZone.Application.Features.Sellers.Queries.GetPrivateDetails;
using MazadZone.Domain.Auctions;

namespace Tests.Application.Features.Sellers.Queries.GetPrivateDetails;

public class GetPrivateSellerDetailsValidatorTests
{
    private readonly GetPrivateSellerDetailsValidator _validator;

    public GetPrivateSellerDetailsValidatorTests()
    {
        _validator = new GetPrivateSellerDetailsValidator();
    }

    [Fact]
    public void Validate_ValidQuery_PassesValidation()
    {
        // Arrange
        var query = SellerHelper.CreateGetPrivateSellerDetailsQuery();

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.IsValid.ShouldBeTrue();
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_SellerIdIsEmpty_FailsValidation()
    {
        // Arrange
        // Passing an empty Guid to trigger the failure condition in your custom extension
        var query = SellerHelper.CreateGetPrivateSellerDetailsQuery() with { SellerId = SellerId.From(Guid.Empty) };

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.IsValid.ShouldBeFalse();
        
        // Verifies that your MustBeValidSellerId() extension caught the bad input
        result.ShouldHaveValidationErrorFor(x => x.SellerId);
    }
}