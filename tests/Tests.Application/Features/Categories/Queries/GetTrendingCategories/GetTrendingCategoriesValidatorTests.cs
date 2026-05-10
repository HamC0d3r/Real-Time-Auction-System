using FluentValidation.TestHelper;
using MazadZone.Application.Features.Categories.Queries.GetTrendingCategories;

namespace Tests.Application.Features.Categories.Queries.GetTrendingCategories;

public class GetTrendingCategoriesValidatorTests
{
    private readonly GetTrendingCategoriesValidator _validator = new();

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Limit_Should_Have_Error_When_Less_Than_One(int invalidLimit)
    {
        var query = new GetTrendingCategoriesQuery(invalidLimit);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.Limit);
    }

    [Fact]
    public void Limit_Should_Be_Valid_When_Positive()
    {
        var query = new GetTrendingCategoriesQuery(10);
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveAnyValidationErrors();
    }
}