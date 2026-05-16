using MazadZone.Application.Common.Validation;
using MazadZone.Application.Features.Orders.Commands.OpenDispute;

namespace MazadZone.Application.Orders.OpenDispute;

public class OpenDisputeValidator : AbstractValidator<OpenDisputeCommand>
{
    public OpenDisputeValidator()
    {
        RuleFor(x => x.OrderId).MustBeValidOrderId();

        RuleFor(x => x.Reason).MustBeValidReason();
    }
}