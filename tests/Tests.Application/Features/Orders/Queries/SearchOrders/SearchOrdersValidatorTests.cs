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
    public void Should_Not_Have_Error_When_Filter_Is_Valid()
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
    public void Should_Have_Error_When_PageNumber_Is_Less_Than_One()
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
    public void Should_Have_Error_When_PageSize_Is_Out_Of_Range(int invalidSize)
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
    public async Task Should_Have_Error_When_Filter_Is_Null()
    {
        // Arrange
        var query = new SearchOrdersQuery(null!);

        // Act
        var result = _validator.TestValidate(query);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Filter);
    }
}