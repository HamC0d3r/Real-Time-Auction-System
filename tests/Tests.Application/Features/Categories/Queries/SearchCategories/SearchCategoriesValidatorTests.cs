using FluentValidation.TestHelper;
using MazadZone.Application.Features.Categories.Queries.SearchCategories;

namespace Tests.Application.Features.Categories.Queries.SearchCategories;

public class SearchCategoriesValidatorTests
{
    private readonly SearchCategoriesQueryValidator _validator = new();

    [Theory]
    [InlineData("")]
    [InlineData("a")] // Below MinimumLength(2)
    public void SearchTerm_Should_Have_Error_When_Too_Short(string term)
    {
        var query = new SearchCategoriesQuery(term);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.SearchTerm);
    }

    [Fact]
    public void SearchTerm_Should_Have_Error_When_Too_Long()
    {
        var query = new SearchCategoriesQuery(new string('a', 51));
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.SearchTerm);
    }
}