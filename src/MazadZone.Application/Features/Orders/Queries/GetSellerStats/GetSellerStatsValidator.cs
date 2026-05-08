using MazadZone.Application.Common.Validation;

namespace MazadZone.Application.Features.Orders.Queries.GetSellerStats;

public class GetSellerStatsValidator : AbstractValidator<GetSellerStatsQuery>
{
    public GetSellerStatsValidator()
    {
        RuleFor(x => x.SellerId).MustBeValidSellerId();
    }
}
