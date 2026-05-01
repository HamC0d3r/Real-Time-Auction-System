namespace MazadZone.Application.Features.Orders.Commands.DeliverOrder;

public class DeliverOrderValidator : AbstractValidator<DeliverOrderCommand>
{
    public DeliverOrderValidator()
    {
        RuleFor(x => x.OrderId)
            .ValidateOrderId();
    }
}