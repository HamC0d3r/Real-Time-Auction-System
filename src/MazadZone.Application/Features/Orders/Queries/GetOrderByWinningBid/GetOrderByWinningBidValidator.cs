namespace MazadZone.Application.Features.Orders.Queries.GetOrderByWinningBid;

public class GetOrderByWinningBidValidator : AbstractValidator<GetOrderByWinningBidQuery>
{
    public GetOrderByWinningBidValidator()
    {
        RuleFor(x => x.WinningBidId)
            .NotNull()
            .Must(id => id.Value != Guid.Empty).WithMessage("Bid ID cannot be empty.");
    }
}
