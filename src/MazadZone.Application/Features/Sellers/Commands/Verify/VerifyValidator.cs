using MazadZone.Application.Common.Validation;

namespace MazadZone.Application.Features.Sellers.Commands.Verify;

public sealed class VerifyValidator : AbstractValidator<VerifyCommand>
{
    public VerifyValidator()
    {
        RuleFor(x => x.SellerId).MustBeValidSellerId();
    }
}