using FluentValidation;
using MazadZone.Application.Features.Orders.Commands.CreateOrder;

namespace MazadZone.Application.Orders.CreateOrder;

public class CreateOrderValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderValidator()
    {
        RuleFor(x => x.BidderId).NotEmpty();
        RuleFor(x => x.WinningBidId).NotEmpty();
        RuleFor(x => x.ReceiptAddressId).NotEmpty();
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.DepositCaptureTransactionId).NotEmpty();
    }
}