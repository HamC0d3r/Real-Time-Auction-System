using MazadZone.Application.Common.Validation;

namespace MazadZone.Application.Features.Orders.Queries.GetOrderDetails;
public class GetOrderDetailsValidator : AbstractValidator<GetOrderDetailsQuery>
{
    public GetOrderDetailsValidator()
    {
        RuleFor(x => x.OrderId).MustBeValidOrderId();
    }
}