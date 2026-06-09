using MazadZone.Application.Features.Auctions.Commands.CancelAuctionByAdmin;
using MazadZone.Application.Features.Auctions.DTOs;
using MazadZone.Application.Features.Auctions.Enums;
using MazadZone.Application.Services;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Repositories;
using Microsoft.Extensions.Logging;

namespace MazadZone.Application.Features.Auctions.Commands.CancelAuctionByAdmin;

public class CancelAuctionByAdminHandler
(
    IAuctionRepository _auctionRepository,
    IUnitOfWork _unitOfWork,
    ILogger<CancelAuctionByAdminHandler> _logger,
    IAuctionStreamService _auctionStreamService
)
: ICommandHandler<CancelAuctionByAdminCommand, Unit>
{
    //<summary>
    /// Handles the cancellation of an auction by an admin. It retrieves the auction by ID, attempts to set
    /// it as cancelled by admin, and updates the repository. Logs all steps and returns appropriate results.
    /// </summary> <param name="request">The command containing the auction ID to cancel by admin.</param>
    /// <param name="cancellationToken">Token for cancelling the operation.</param>
    /// <returns>A Result indicating success or failure of the operation.</returns>
    public async Task<Result<Unit>> Handle(CancelAuctionByAdminCommand request, CancellationToken cancellationToken)
    {
        CancelAuctionByAdminLog.LogHandlingCancelAuctionByAdmin(_logger, request.AuctionId.Value);

        var auctionResult = await _auctionRepository.GetByIdAsync(request.AuctionId, cancellationToken);
        if (auctionResult is null)
        {
            CancelAuctionByAdminLog.LogAuctionNotFound(_logger, request.AuctionId.Value);
            return Result.Failure<Unit>(AuctionErrors.NotFound);

        }

        var auction = auctionResult;
        var updateResult = auction.MarkAsCancelledByAdmin();
        if (updateResult.IsFailure)
        {
            CancelAuctionByAdminLog.LogDomainViolation(_logger, request.AuctionId.Value, updateResult.TopError.Message);
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
                    Status = AuctionStatus.Cancelled.ToString(),
                },
                cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to broadcast auction cancelled by admin event for Auction ID: {AuctionId}", request.AuctionId.Value);
        }
        

        CancelAuctionByAdminLog.LogAuctionCancelled(_logger, request.AuctionId.Value);
        return Result.Success(Unit.Value);
    }
}