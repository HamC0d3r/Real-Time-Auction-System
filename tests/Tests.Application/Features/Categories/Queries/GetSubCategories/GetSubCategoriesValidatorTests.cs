using FluentValidation.TestHelper;
using MazadZone.Application.Features.Categories.Queries.GetSubCategories;
using MazadZone.Domain.Categories;

namespace Tests.Application.Features.Categories.Queries.GetSubCategories;

public class GetSubCategoriesValidatorTests
{
    private readonly GetSubCategoriesValidator _validator = new();

    [Fact]
    public void Should_Have_Error_When_ParentId_Is_Empty()
    {
        var query = new GetSubCategoriesQuery(CategoryId.Empty);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.ParentId);
    }
}