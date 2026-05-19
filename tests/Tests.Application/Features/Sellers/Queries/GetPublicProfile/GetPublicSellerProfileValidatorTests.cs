using MazadZone.Application.Features.Sellers.Queries.GetPublicProfile;
using MazadZone.Domain.Auctions;

namespace Tests.Application.Features.Sellers.Queries.GetPublicProfile;

public class GetPublicSellerProfileValidatorTests
{
    private readonly GetPublicSellerProfileValidator _validator;

    public GetPublicSellerProfileValidatorTests()
    {
        _validator = new GetPublicSellerProfileValidator();
    }

    [Fact]
    public void Validate_ValidQuery_PassesValidation()
    {
        // Arrange
        var query = SellerHelper.CreateGetPublicSellerProfileQuery();

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
        var query = SellerHelper.CreateGetPublicSellerProfileQuery() with { SellerId = SellerId.Empty };

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.IsValid.ShouldBeFalse();
        result.ShouldHaveValidationErrorFor(x => x.SellerId);
    }
}