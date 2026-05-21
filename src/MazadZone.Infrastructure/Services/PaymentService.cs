using MazadZone.Application.Services;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Orders;
using MzadZone.Domain.Payments;

namespace MazadZone.Infrastructure.Services;

public class PaymentService : IPaymentService
{
    public Task<string> AuthorizeAsync(BidId bidId, Money depositAmount, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public Task<string?> CaptureHoldedAmountAsync(string gatewayAuthHoldId, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public Task<string?> CaptureRemainingAmountAsync(Payment payment, Money remainingAmount, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public Task UnAuthorizeAsync(string gatewayAuthHoldId, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}