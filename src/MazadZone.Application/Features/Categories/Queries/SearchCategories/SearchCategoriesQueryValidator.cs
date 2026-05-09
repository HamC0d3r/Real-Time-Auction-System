namespace MazadZone.Application.Features.Categories.Queries.SearchCategories;

using FluentValidation;

public sealed class SearchCategoriesQueryValidator : AbstractValidator<SearchCategoriesQuery>
{
    public SearchCategoriesQueryValidator()
    {
        RuleFor(x => x.SearchTerm).NotEmpty().MinimumLength(2).MaximumLength(50);
    }
}