namespace MazadZone.Application.Features.Orders.Queries.GetOrderDetails;
public class GetOrderDetailsValidator : AbstractValidator<GetOrderDetailsQuery>
{
    public GetOrderDetailsValidator()
    {
        RuleFor(x => x.OrderId)
            .NotNull()
            .Must(id => id.Value != Guid.Empty).WithMessage("Order ID cannot be empty.");
    }
}