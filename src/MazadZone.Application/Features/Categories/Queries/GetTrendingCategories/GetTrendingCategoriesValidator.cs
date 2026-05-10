namespace MazadZone.Application.Features.Categories.Queries.GetTrendingCategories;

public class GetTrendingCategoriesValidator : AbstractValidator<GetTrendingCategoriesQuery>
{
    public GetTrendingCategoriesValidator()
    {
        RuleFor(x => x.Limit)
            .GreaterThan(0)
            .WithMessage("Limit must be greater than 0.");
    }
}