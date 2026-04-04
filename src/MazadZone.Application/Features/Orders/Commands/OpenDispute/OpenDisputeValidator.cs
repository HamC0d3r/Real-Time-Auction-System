using FluentValidation;

namespace MazadZone.Application.Orders.OpenDispute;

public class OpenDisputeValidator : AbstractValidator<OpenDisputeCommand>
{
    public OpenDisputeValidator()
    {
        RuleFor(x => x.Reason).NotEmpty().MaximumLength(1000);
    }
}