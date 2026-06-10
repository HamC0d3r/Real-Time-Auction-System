using MazadZone.Application.Features.Auctions.DTOs;
using MazadZone.Application.Features.Auctions.Enums;
using MazadZone.Application.Services;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Repositories;
using MazadZone.Application.Common.Exceptions;
using MediatR;
using Microsoft.Extensions.Logging;

namespace MazadZone.Application.Features.Auctions.Commands.PlaceBid;

public class PlaceBidHandler(
    IAuctionRepository _auctionRepository,
    IPaymentService _paymentService,
    IUnitOfWork unitOfWork,
    IDateTimeProvider _dateTimeProvider,
    ILogger<PlaceBidHandler> _logger,
    IAuctionStreamService _auctionStreamService
) : IRequestHandler<PlaceBidCommand, Result<Unit>> // Adjusted interface to IRequestHandler for MediatR standard
{
    public async Task<Result<Unit>> Handle(PlaceBidCommand request, CancellationToken cancellationToken)
    {
        PlaceBidLog.LogPlaceBidAttempt(_logger, request.AuctionId.Value, request.BidderId.Value, request.Amount.Amount);

        var auction = await _auctionRepository.GetByIdWithBidsAsync(request.AuctionId, cancellationToken);

        if (auction is null)
        {
            PlaceBidLog.LogAuctionNotFound(_logger, request.AuctionId.Value);
            return Result.Failure<Unit>(AuctionErrors.NotFound);
        }
        var placeBidTime = _dateTimeProvider.Now;

        Console.WriteLine($"\n\nAuction: {auction?.Id}");
        Console.WriteLine($"Auction: {auction?.Status}");
        Console.WriteLine($"Auction: {auction?.StartTime}");
        Console.WriteLine($"Auction: {auction?.EndTime}");
        Console.WriteLine($"Auction: {auction?.CurrentLeadingBid?.Amount.Amount}");
        Console.WriteLine($"Auction: {auction?.CurrentLeadingBid?.BidderId.Value}");
        Console.WriteLine($"Auction: {auction?.CurrentLeadingBid?.PlacedAtUtc}");
        Console.WriteLine($"Auction: {auction?.CurrentLeadingBid?.PlacedAtUtc}");
        // 1. Pre-flight Check
        var validationResult = auction.ValidateBidEligibility(request.Amount.Amount, placeBidTime);

        Console.WriteLine($"\nAuction: {auction?.Id}");
        Console.WriteLine($"Auction: {auction?.Status}");
        Console.WriteLine($"Auction: {auction?.StartTime}");
        Console.WriteLine($"Auction: {auction?.EndTime}");
        Console.WriteLine($"Auction: {placeBidTime}");
        Console.WriteLine($"Auction: {auction?.CurrentLeadingBid?.Amount.Amount}");
        Console.WriteLine($"Auction: {auction?.CurrentLeadingBid?.BidderId.Value}");
        Console.WriteLine($"Auction: {auction?.CurrentLeadingBid?.PlacedAtUtc}");
        Console.WriteLine($"Auction: {auction?.CurrentLeadingBid?.PlacedAtUtc}");

        if (validationResult.IsFailure)
        {
            PlaceBidLog.LogDomainViolation(_logger, request.AuctionId.Value, validationResult.TopError.Message);
            return Result.Failure<Unit>(validationResult.TopError);
        }

        // 2. connect with payment service
        string authHoldId = await _paymentService.AuthorizeAsync(
            userId: request.BidderId.Value,
            auctionId: request.AuctionId.Value,
            methodId: request.PaymentMethodId,
            depositAmount: validationResult.Value,
            cancellationToken: cancellationToken
        );

        if (string.IsNullOrEmpty(authHoldId))
        {
            PlaceBidLog.LogPaymentAuthorizationFailed(_logger, request.AuctionId.Value, request.BidderId.Value);
            return Result.Failure<Unit>(AuctionErrors.PaymentAuthorizationFailed);
        }

        // 3. execute in domain
        var placeBidResult = auction.PlaceBid(request.BidderId, request.Amount.Amount, authHoldId, _dateTimeProvider.Now);

        if (placeBidResult.IsFailure)
        {
            // rollback financial 
            await _paymentService.UnAuthorizeAsync(authHoldId, cancellationToken);
            PlaceBidLog.LogDomainViolation(_logger, request.AuctionId.Value, placeBidResult.TopError.Message);
            return Result.Failure<Unit>(placeBidResult.TopError);
        }

        // 4. save in database and catch concurency problem
        try
        {
            _auctionRepository.Update(auction);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (ConcurrencyConflictException)
        {
            // rollback financial
            await _paymentService.UnAuthorizeAsync(authHoldId, cancellationToken);
            PlaceBidLog.LogPersistenceFailed(_logger, request.AuctionId.Value, request.BidderId.Value, "Concurrency conflict: You were outbid during processing.");
            return Result.Failure<Unit>(AuctionErrors.ConcurrencyConflict);
        }
        catch (Exception ex)
        {
            // database errors
            await _paymentService.UnAuthorizeAsync(authHoldId, cancellationToken);
            PlaceBidLog.LogPersistenceFailed(_logger, request.AuctionId.Value, request.BidderId.Value, ex.Message);
            return Result.Failure<Unit>(AuctionErrors.DatabaseError);
        }

        try
        {
            await _auctionStreamService.BroadcastAuctionUpdateAsync(
                BroadcastAuctionUpdateTypes.BidPlaced,
                new AuctionBidUpdateDto
                {
                    AuctionId = request.AuctionId.Value,
                    NewPrice = auction.CurrentHighestBidAmount.Amount,
                },
                cancellationToken);

            await _auctionStreamService.BroadcastAuctionUpdateAsync(
                BroadcastAuctionUpdateTypes.StatusChanged,
                new AuctionStatusUpdateDto
                {
                    AuctionId = request.AuctionId.Value,
                    Status = AuctionStatus.Active.ToString(),
                },
                cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to broadcast bid placed event for Auction ID: {AuctionId}", request.AuctionId.Value);
        }

        PlaceBidLog.LogSuccess(_logger, request.AuctionId.Value, request.BidderId.Value);
        return Result.Success(Unit.Value);
    }
}