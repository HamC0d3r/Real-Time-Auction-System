using MazadZone.Application.Features.Orders.Commands.Create;
using MazadZone.Application.Features.Payments.Commands.RecordAuthorizationHold;
using MazadZone.Application.Features.Payments.Commands.CaptureAuthorizedHold;
using MazadZone.Application.Features.Payments.Commands.UnauthorizeOutbidPayments;
using MazadZone.Domain.Auctions.Events;
using MazadZone.Domain.Repositories;
using MazadZone.Domain.Users.ValueObjects;
using MzadZone.Domain.Payments;
using MazadZone.Application.Services;
using MazadZone.Application.Features.Bidders.DTOs;

namespace MazadZone.Application.Features.Auctions.Commands.EndAuction.EventHandlers;
/// <summary>
/// Handles the creation of an order when an auction ends.
/// </summary>
/// <param name="_paymentRepository">Repository for managing payments.</param>
/// <param name="_auctionRepository">Repository for managing auctions.</param>
/// <param name="_unitOfWork">Unit of work for managing transactions.</param>
/// <param name="_sender">Mediator for sending commands.</param>
/// <param name="_logger">Logger for logging information and errors.</param>
/// <param name="_userQueries">Service for querying user information.</param>
/// <typeparam name="CreateAuctionEndedOrderEventHandler"></typeparam>
/// <remarks>
/// This event handler listens for the AuctionEndedDomainEvent, which is triggered when an auction ends
/// It performs the following steps:
/// 1. Retrieves the auction details using the auction ID from the event.
/// 2. If the auction is not found, it logs a warning and exits.
/// 3. If the auction is found and is in a cancelled state, it proceeds to create an order for the winning bid.
/// 4. It creates a payment ledger for the winning bid and records the authorization hold transaction.
/// 5. It captures the authorized hold amount for the winning bid.
/// 6. It releases the hold amount for all outbid bidders.
/// 7. It saves all changes to the database.
/// This handler ensures that the order creation and payment processing are handled seamlessly when an auction ends, providing a smooth experience for the winning bidder and ensuring that all necessary transactions are recorded accurately.
/// </remarks>

public class CreateAuctionEndedOrderEventHandler
(
    IPaymentRepository _paymentRepository,
    IAuctionRepository _auctionRepository,
    IUnitOfWork _unitOfWork,
    ISender _sender,
    ILogger _logger,
    IUserQueries _userQueries
) : INotificationHandler<AuctionEndedDomainEvent>
{

    public async Task Handle(AuctionEndedDomainEvent notification, CancellationToken cancellationToken)
    {
        var auction = await _auctionRepository.GetByIdAsync(notification.AuctionId, cancellationToken);
        if (auction is null)
        {
            _logger.LogWarning("Auction with ID {AuctionId} not found for ended event.", notification.AuctionId);
            return;
        }
        
        var WiningBidId = auction.CurrentLeadingBid.Id;
        var FinalAmount = auction.CurrentLeadingBid.Amount;

        var address = await _userQueries.GetAddressByIdAsync(auction.CurrentLeadingBid.BidderId.Value, cancellationToken);
        if (address is null)
        {
            _logger.LogWarning("Address for user with ID {UserId} not found for ended event.", auction.CurrentLeadingBid.BidderId.Value);
            return;
        }

        // 1. Create the Order aggregate
        var result = await _sender.Send(new CreateOrderCommand(
            AuctionId: auction.Id,
            BidderId: auction.CurrentLeadingBid!.BidderId,
            WinningBidId: WiningBidId,
            ReceiptAddress: AddressDto.FromAddress(address.Value),
            Amount: FinalAmount.Amount,
            DepositCaptureTransactionId: auction.CurrentLeadingBid.GatewayAuthHoldId
        ), cancellationToken);
        
        if (result.IsFailure)
        {
            _logger.LogError("Failed to create order for Auction {AuctionId} with error: {ErrorMessage}", auction.Id, result.TopError.Message);
            // Handle order creation failure (e.g., mark payment as failed, notify user, etc.)
            return;
        }

        // 2. Create the Payment Ledger
        var paymentResult = Payment.Create(result.Value, UserId.Load(auction.CurrentLeadingBid.BidderId.Value), auction.CurrentLeadingBid.DepositAmount);
        var payment = paymentResult.Value;

        var GatewayAuthHoldId = auction.CurrentLeadingBid.GatewayAuthHoldId;

        // 3. Record the authorization hold transaction using Payment Command
        var recordAuthHoldResult = await _sender.Send(
            new RecordAuthorizationHoldCommand(payment, GatewayAuthHoldId), 
            cancellationToken);

        if (recordAuthHoldResult.IsFailure)
        {
            _logger.LogError("Failed to record authorization hold for Payment {PaymentId}: {ErrorMessage}", 
                payment.Id, recordAuthHoldResult.TopError.Message);
            return;
        }

        await _paymentRepository.AddAsync(payment, cancellationToken);

        // 4. Capture the authorized hold amount using Payment Command
        var captureHoldResult = await _sender.Send(
            new CaptureAuthorizedHoldCommand(payment, GatewayAuthHoldId),
            cancellationToken);

        if (captureHoldResult.IsFailure)
        {
            _logger.LogError("Failed to capture authorized hold for Payment {PaymentId}: {ErrorMessage}",
                payment.Id, captureHoldResult.TopError.Message);
            return;
        }

        // 5. Release the holded amount for all the outbid bidders using Payment Command
        var outbidAuthHoldIds = auction.Bids
            .Where(b => b.Id != WiningBidId)
            .Select(b => b.GatewayAuthHoldId)
            .ToList();

        if (outbidAuthHoldIds.Count > 0)
        {
            var unauthorizeResult = await _sender.Send(
                new UnauthorizeOutbidPaymentsCommand(outbidAuthHoldIds),
                cancellationToken);

            if (unauthorizeResult.IsFailure)
            {
                _logger.LogWarning("Failed to unauthorize outbid payments: {ErrorMessage}", 
                    unauthorizeResult.TopError.Message);
                // Continue processing even if this fails
            }
        }
        
        await _unitOfWork.SaveChangesAsync();
    }
}