namespace MazadZone.Application.Features.Orders.Commands.ConfirmOrder;

public class ConfirmOrderValidator : AbstractValidator<ConfirmOrderCommand>
{
    public ConfirmOrderValidator()
    {
        RuleFor(x => x.OrderId)
            .ValidateOrderId();
    }
}