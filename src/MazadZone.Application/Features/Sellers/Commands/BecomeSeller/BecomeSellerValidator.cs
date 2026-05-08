using MazadZone.Application.Common.Validation;
using MazadZone.Application.Features.Sellers.Validation;

namespace MazadZone.Application.Features.Sellers.Commands.BecomeSeller;

public sealed class BecomeSellerValidator : AbstractValidator<BecomeSellerCommand>
{
    public BecomeSellerValidator()
    {
        RuleFor(x => x.BidderId).MustBeValidBidderId();
        RuleFor(x => x.BankAccountNumber).MustBeValidBankAccount();
    }
}