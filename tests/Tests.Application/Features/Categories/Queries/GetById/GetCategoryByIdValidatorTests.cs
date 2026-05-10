using FluentValidation.TestHelper;
using MazadZone.Application.Features.Categories.Queries.GetById;
using MazadZone.Domain.Categories;

namespace Tests.Application.Features.Categories.Queries.GetById;

public class GetCategoryByIdValidatorTests
{
    private readonly GetCategoryByIdQueryValidator _validator = new();

    [Fact]
    public void Should_Have_Error_When_CategoryId_Is_Empty()
    {
        var query = new GetCategoryByIdQuery(CategoryId.Empty);
        var result = _validator.TestValidate(query);
        result.ShouldHaveValidationErrorFor(x => x.CategoryId);
    }
}