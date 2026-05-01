namespace MazadZone.Application.Features.Orders.Queries.GetSellerStats;

public class GetSellerStatsValidator : AbstractValidator<GetSellerStatsQuery>
{
    public GetSellerStatsValidator()
    {
        RuleFor(x => x.SellerId)
            .NotNull()
            .Must(id => id.Value != Guid.Empty).WithMessage("Seller ID cannot be empty.");
    }
}
