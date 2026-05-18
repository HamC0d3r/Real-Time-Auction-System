using MazadZone.Application.Features.Orders.Queries.DTOs;
using MazadZone.Application.Features.Orders.Queries.SearchOrders;

namespace Tests.Application.Features.Orders.Queries.SearchOrders;

public class SearchOrdersValidatorTests
{
    private readonly SearchOrdersValidator _validator;

    public SearchOrdersValidatorTests()
    {
        _validator = new SearchOrdersValidator();
    }

    [Fact]
    public void Validate_ValidFilter_PassesValidation()
    {
        // Arrange
        var filter = new OrderSearchFilter(null, "Shipped", 20, 1);
        var query = new SearchOrdersQuery(filter);

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.Filter);
        result.ShouldNotHaveValidationErrorFor(x => x.Filter.PageNumber);
        result.ShouldNotHaveValidationErrorFor(x => x.Filter.PageSize);
    }

    [Fact]
    public void Validate_PageNumberLessThanOne_FailsValidation()
    {
        // Arrange - Testing the GreaterThanOrEqualTo(1) rule
        var filter = new OrderSearchFilter(null, null, 10, 0);
        var query = new SearchOrdersQuery(filter);

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Filter.PageNumber);
    }

    [Theory]
    [InlineData(0)]   // Too small
    [InlineData(101)] // Too large (Greater than 100)
    public void Validate_PageSizeOutOfRange_FailsValidation(int invalidSize)
    {
        // Arrange
        var filter = new OrderSearchFilter(null, null, invalidSize, 1);
        var query = new SearchOrdersQuery(filter);

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Filter.PageSize);
    }

    [Fact]
    public async Task Validate_FilterIsNull_FailsValidation()
    {
        // Arrange
        var query = new SearchOrdersQuery(null!);

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Filter);
    }
}