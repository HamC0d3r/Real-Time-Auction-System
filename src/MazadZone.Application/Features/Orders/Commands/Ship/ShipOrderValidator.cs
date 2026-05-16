using MazadZone.Application.Common.Validation;

namespace MazadZone.Application.Features.Orders.Commands.ShipOrder;

public class ShipOrderValidator : AbstractValidator<ShipOrderCommand>
{
    public ShipOrderValidator()
    {
        RuleFor(x => x.OrderId).MustBeValidOrderId();
    }
}