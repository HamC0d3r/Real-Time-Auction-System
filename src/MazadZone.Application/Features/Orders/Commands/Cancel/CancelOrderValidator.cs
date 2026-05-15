using MazadZone.Application.Common.Validation;

namespace MazadZone.Application.Features.Orders.Commands.CancelOrder;

public class CancelOrderValidator : AbstractValidator<CancelOrderCommand>
{
    public CancelOrderValidator()
    {
        RuleFor(x => x.OrderId).MustBeValidOrderId();
    }
}