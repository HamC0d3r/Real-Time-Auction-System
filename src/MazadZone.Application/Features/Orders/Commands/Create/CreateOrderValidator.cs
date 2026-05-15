using MazadZone.Application.Common.Validation;
using MazadZone.Application.Common.Validators;

namespace MazadZone.Application.Features.Orders.Commands.Create;

public class CreateOrderValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderValidator()
    {
        RuleFor(x => x.BidderId).MustBeValidBidderId();
        RuleFor(x => x.WinningBidId).MustBeValidBidId();
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.DepositCaptureTransactionId).NotEmpty();


        RuleFor(x => x.ReceiptAddress)
            .SetValidator(new AddressDtoValidator());
    }
}