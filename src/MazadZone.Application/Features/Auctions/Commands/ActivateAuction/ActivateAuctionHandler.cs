using MazadZone.Application.Features.Auctions.DTOs;
using MazadZone.Application.Features.Auctions.Enums;
using MazadZone.Application.Services;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Repositories;
using Microsoft.Extensions.Logging;

namespace MazadZone.Application.Features.Auctions.Commands.ActivateAuction;

public class ActivateAuctionHandler
(
    IAuctionRepository _auctionRepository,
    IDateTimeProvider  _dateTimeProvider,
    IUnitOfWork _unitOfWork,
    ILogger<ActivateAuctionHandler> _logger,
    IAuctionStreamService _auctionStreamService
)
: ICommandHandler<ActivateAuctionCommand, Unit>
{
    /// <summary>
    /// Handles the activation of an auction. It retrieves the auction by ID, attempts to set
    /// it as active, and updates the repository. Logs all steps and returns appropriate results.
    /// </summary> <param name="request">The command containing the auction ID to activate.</param>
    /// <param name="cancellationToken">Token for cancelling the operation.</param>
    /// <returns>A Result indicating success or failure of the operation.</returns>

    public async Task<Result<Unit>> Handle(ActivateAuctionCommand request, CancellationToken cancellationToken)
    {
        ActivateAuctionLog.LogHandlingActivateAuction(_logger, request.AuctionId.Value);

        var auctionResult = await _auctionRepository.GetByIdAsync(request.AuctionId, cancellationToken);
        
        if (auctionResult is null)
        {
            ActivateAuctionLog.LogAuctionNotFound(_logger, request.AuctionId.Value);
            return Result.Failure<Unit>(AuctionErrors.NotFound);

        }

        var auction = auctionResult;
        var updateResult = auction.MarkAsActive(_dateTimeProvider.Now);

        if (updateResult.IsFailure)
        {
            ActivateAuctionLog.LogDomainViolation(_logger, request.AuctionId.Value, updateResult.TopError.Message);
            return Result.Failure<Unit>(updateResult.TopError);
        }
            

        _auctionRepository.Update(auction); 
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        try
        {
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
            _logger.LogError(ex, "Failed to broadcast auction started event for Auction ID: {AuctionId}", request.AuctionId.Value);
        }

        ActivateAuctionLog.LogAuctionActivated(_logger, request.AuctionId.Value);
        return Result.Success(Unit.Value);
    }
}