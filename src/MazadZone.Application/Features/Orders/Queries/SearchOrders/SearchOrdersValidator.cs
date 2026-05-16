namespace MazadZone.Application.Features.Orders.Queries.SearchOrders;

// 2. The Validator
public class SearchOrdersValidator : AbstractValidator<SearchOrdersQuery>
{
    public SearchOrdersValidator()
    {
        // 1. Check the parent object first
        RuleFor(x => x.Filter)
            .NotNull()
            .WithMessage("Filter cannot be null.");

        // 2. Wrap child properties in a null guard
        // This prevents the NullReferenceException when testing with a null filter
        When(x => x.Filter is not null, () => 
        {
            RuleFor(x => x.Filter.PageNumber)
                .GreaterThanOrEqualTo(1);

            RuleFor(x => x.Filter.PageSize)
                .GreaterThan(0)
                .LessThanOrEqualTo(100)
                .WithMessage("Page size must be between 1 and 100.");
        });
    }
}
