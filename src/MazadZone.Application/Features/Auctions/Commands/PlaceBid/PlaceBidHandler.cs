using MazadZone.Application.Common;
using MazadZone.Application.Services;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Repositories;
using MazadZone.Domain.Users;
using MazadZone.Domain.ValueObjects;
using Microsoft.Extensions.Logging;

namespace MazadZone.Application.Features.Auctions.Commands.PlaceBid;
/// <summary>
/// Handles the logic for placing a bid on an auction. It checks if the bid is valid, authorizes payment, and updates the auction state accordingly. Logs all steps and handles errors gracefully.
/// </summary>
/// <param name="_auctionRepository"></param>
/// <param name="_paymentService"></param>
/// <param name="unitOfWork"></param>
/// <param name="_dateTimeProvider"></param>
/// <param name="_logger"></param> 
/// <summary>
/// The PlaceBidHandler class is responsible for handling the PlaceBidCommand, which involves placing a bid on an auction. It performs several steps:
/// 1. Logs the attempt to place a bid.
/// 2. Retrieves the auction from the repository using the provided auction ID.
/// 3. Checks if the auction exists; if not, it logs the issue and returns a failure result.
/// 4. Validates the bid against the auction's rules (e.g., minimum bid, auction status) and retrieves necessary details for placing the bid.
/// 5. If the bid is valid, it attempts to authorize the payment for the bid's deposit amount.
/// 6. If payment authorization fails, it logs the failure and returns a failure result.
/// 7. If payment authorization succeeds, it places the bid on the auction and updates the auction state.
/// 8. It then attempts to save the changes to the repository. If saving fails, it un-authorizes the payment and logs the persistence failure.
/// 9. If everything succeeds, it logs the successful bid placement and returns a success result. The handler ensures that all operations are logged for traceability and that any errors are handled gracefully to maintain system integrity.
/// </summary>
/// <typeparam name="PlaceBidHandler"></typeparam>
public class PlaceBidHandler(
    IAuctionRepository _auctionRepository,
    IPaymentService _paymentService,
    IUnitOfWork unitOfWork,
    IDateTimeProvider _dateTimeProvider,
    ILogger<PlaceBidHandler> _logger
) : ICommandHandler<PlaceBidCommand, Unit>
{
    public async Task<Result<Unit>> Handle(PlaceBidCommand request, CancellationToken cancellationToken)
    {
        PlaceBidLog.LogPlaceBidAttempt(_logger, request.AuctionId.Value, request.BidderId.Value, request.Amount.Amount);

        var auction = await _auctionRepository.GetByIdAsync(request.AuctionId, cancellationToken);

        if (auction is null)
        {
            PlaceBidLog.LogAuctionNotFound(_logger, request.AuctionId.Value);
            return Result.Failure<Unit>(AuctionErrors.NotFound);
        }

        // Check if the bid can be placed and get the necessary details for placing the bid (like deposit amount)
        var checkPlaceBidResult = auction.CheckPlaceBid(request.BidderId, request.Amount.Amount, _dateTimeProvider.UtcNow);

        if (checkPlaceBidResult.IsFailure)
        {
            PlaceBidLog.LogDomainViolation(_logger, request.AuctionId.Value, checkPlaceBidResult.TopError.Message);
            return Result.Failure<Unit>(checkPlaceBidResult.TopError);
        }

        string authHoldId = await _paymentService.AuthorizeAsync(checkPlaceBidResult.Value.Id, checkPlaceBidResult.Value.DepositAmount, cancellationToken);

        if (string.IsNullOrEmpty(authHoldId))
        {
            PlaceBidLog.LogPaymentAuthorizationFailed(_logger, request.AuctionId.Value, request.BidderId.Value);
            return Result.Failure<Unit>(AuctionErrors.PaymentAuthorizationFailed);
        }

        var placeBidResult = auction.PlaceVerifiedBid(checkPlaceBidResult.Value, authHoldId, _dateTimeProvider.UtcNow);
        if (placeBidResult.IsFailure)
        {
            PlaceBidLog.LogDomainViolation(_logger, request.AuctionId.Value, placeBidResult.TopError.Message);
            return Result.Failure<Unit>(placeBidResult.TopError);
        }

        try
        {
            _auctionRepository.Update(auction);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            await _paymentService.UnAuthorizeAsync(authHoldId, cancellationToken);
            PlaceBidLog.LogPersistenceFailed(_logger, request.AuctionId.Value, request.BidderId.Value, ex.Message);
            return Result.Failure<Unit>(AuctionErrors.PaymentAuthorizationFailed);
        }

        PlaceBidLog.LogSuccess(_logger, request.AuctionId.Value, request.BidderId.Value);
        return Result.Success(Unit.Value);
    }
}