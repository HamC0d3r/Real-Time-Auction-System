using MazadZone.Application.Common.Validation;

namespace MazadZone.Application.Features.Orders.Commands.Confirm;

public class ConfirmOrderValidator : AbstractValidator<ConfirmOrderCommand>
{
    public ConfirmOrderValidator()
    {
        RuleFor(x => x.OrderId).MustBeValidOrderId();
    }
}