using MazadZone.Application.Features.Orders.Commands.ResolveDispute;

namespace MazadZone.Application.Orders.ResolveDispute;

public class ResolveDisputeValidator : AbstractValidator<ResolveDisputeCommand>
{
    public ResolveDisputeValidator()
    {
        RuleFor(x => x.OrderId)
            .ValidateOrderId();

        RuleFor(x => x.Resolution)
            .ValidateResolution();
    }
}