using FluentValidation.TestHelper;
using MazadZone.Application.Features.Categories.Queries.GetBreadcrumbs;
using MazadZone.Domain.Categories;

namespace Tests.Application.Features.Categories.Queries.GetBreadcrumbs;

public class GetCategoryBreadcrumbsValidatorTests
{
    private readonly GetCategoryBreadcrumbsQueryValidator _validator = new();

    [Fact]
    public void Should_Have_Error_When_CategoryId_Is_Empty()
    {
        var query = new GetCategoryBreadcrumbsQuery(CategoryId.Empty);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.CategoryId);
    }

    [Fact]
    public void Should_Not_Have_Error_When_CategoryId_Is_Valid()
    {
        var query = new GetCategoryBreadcrumbsQuery(CategoryId.New());
        var result = _validator.TestValidate(query);
        result.ShouldNotHaveAnyValidationErrors();
    }
}