namespace MazadZone.Application.Features.Orders.Queries.SearchOrders;

// 2. The Validator
public class SearchOrdersValidator : AbstractValidator<SearchOrdersQuery>
{
    public SearchOrdersValidator()
    {
        RuleFor(x => x.Filter).NotNull();
        RuleFor(x => x.Filter.PageNumber).GreaterThanOrEqualTo(1);
        RuleFor(x => x.Filter.PageSize).GreaterThan(0).LessThanOrEqualTo(100); // Prevent massive queries
    }
}
