using FluentValidation;

namespace MazadZone.Application.Orders.ResolveDispute;

public class ResolveDisputeValidator : AbstractValidator<ResolveDisputeCommand>
{
    public ResolveDisputeValidator()
    {
        RuleFor(x => x.Resolution).NotEmpty().MaximumLength(1000);
    }
}