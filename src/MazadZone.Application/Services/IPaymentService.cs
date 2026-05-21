using MazadZone.Domain.Auctions;
using MazadZone.Domain.Shared.Interfaces;
using MazadZone.Domain.ValueObjects;
using MzadZone.Domain.Payments;

namespace MazadZone.Application.Services;
public interface IPaymentService : IScopedService
{
    Task<string> AuthorizeAsync(BidId bidId, Money depositAmount, CancellationToken cancellationToken);
    Task UnAuthorizeAsync(string gatewayAuthHoldId, CancellationToken cancellationToken);
    Task<string?> CaptureHoldedAmountAsync(string gatewayAuthHoldId, CancellationToken cancellationToken);
    Task<string?> CaptureRemainingAmountAsync(Payment payment, Money remainingAmount, CancellationToken cancellationToken);
}

public record AuthorizationRequest(BidId BidId, Money Amount);