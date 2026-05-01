using FluentValidation;
using MazadZone.Application.Features.Orders.Commands.OpenDispute;

namespace MazadZone.Application.Orders.OpenDispute;

public class OpenDisputeValidator : AbstractValidator<OpenDisputeCommand>
{
    public OpenDisputeValidator()
    {
        RuleFor(x => x.OrderId)
            .ValidateOrderId();

        RuleFor(x => x.Reason)
            .ValidateDisputeReason();
    }
}