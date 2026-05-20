using MazadZone.Application.Features.Auctions.Commands.CancelAuction;
using MazadZone.Application.Services;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Repositories;
using Microsoft.Extensions.Logging;

namespace MazadZone.Application.Features.Auctions.Commands.CancelAuction;

/// <summary>
/// Handles the cancellation of an auction. It retrieves the auction by ID, attempts to set
/// it as cancelled, and updates the repository. Logs all steps and returns appropriate results.
/// </summary> <param name="request">The command containing the auction ID to cancel.</param>
/// <param name="cancellationToken">Token for cancelling the operation.</param>
/// <returns>A Result indicating success or failure of the operation.</returns>
class CancelAuctionHandler(
    IAuctionRepository _auctionRepository,
    IUnitOfWork _unitOfWork ,
    ILogger<CancelAuctionHandler> _logger,
    IDateTimeProvider _dateTimeProvider
    ): ICommandHandler<CancelAuctionCommand, Unit>
{

    public async Task<Result<Unit>> Handle(CancelAuctionCommand request, CancellationToken cancellationToken)
    {
        CancelAuctionLog.LogHandlingCancelAuction(_logger, request.AuctionId.Value);

        var auctionResult = await _auctionRepository.GetByIdAsync(request.AuctionId, cancellationToken);
        if (auctionResult is null)
        {
            CancelAuctionLog.LogAuctionNotFound(_logger, request.AuctionId.Value);
            return Result.Failure<Unit>(AuctionErrors.NotFound);
        }

        var auction = auctionResult;
        var updateResult = auction.MarkAsCancelled(_dateTimeProvider.UtcNow, request.Reason);
        
        if (updateResult.IsFailure)
        {
            CancelAuctionLog.LogDomainViolation(_logger, request.AuctionId.Value, updateResult.TopError.Message);
            return Result.Failure<Unit>(updateResult.TopError);
        }
            


        _auctionRepository.Update(auction); 
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        
        CancelAuctionLog.LogAuctionCancelled(_logger, request.AuctionId.Value);
        return Result.Success(Unit.Value);
    }
}