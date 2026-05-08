using MazadZone.Application.Common.Validation;

namespace MazadZone.Application.Features.Orders.Queries.GetOrderByWinningBid;

public class GetOrderByWinningBidValidator : AbstractValidator<GetOrderByWinningBidQuery>
{
    public GetOrderByWinningBidValidator()
    {
        RuleFor(x => x.WinningBidId).MustBeValidBidId();
    }
}
