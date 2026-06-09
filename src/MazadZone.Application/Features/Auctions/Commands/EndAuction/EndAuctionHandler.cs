using MazadZone.Application.Features.Auctions.DTOs;
using MazadZone.Application.Features.Auctions.Enums;
using MazadZone.Application.Services;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Repositories;
using Microsoft.Extensions.Logging;

namespace MazadZone.Application.Features.Auctions.Commands.EndAuction;
/// <summary>
/// Handles the ending of an auction. It retrieves the auction by ID, attempts to set
/// </summary>
/// <param name="_auctionRepository"></param>
/// <param name="_dateTimeProvider"></param>
/// <param name="_unitOfWork"></param>
/// <param name="_logger"></param> 
/// <typeparam name="EndAuctionHandler"></typeparam>
public class EndAuctionHandler
(
    IAuctionRepository _auctionRepository,
    IDateTimeProvider  _dateTimeProvider,
    IUnitOfWork _unitOfWork,
    ILogger<EndAuctionHandler> _logger,
    IAuctionStreamService _auctionStreamService
)
: ICommandHandler<EndAuctionCommand, Unit>
{
    public async Task<Result<Unit>> Handle(EndAuctionCommand request, CancellationToken cancellationToken)
    {
        EndAuctionLog.LogHandlingEndAuction(_logger, request.AuctionId.Value);

        var auctionResult = await _auctionRepository.GetByIdAsync(request.AuctionId, cancellationToken);
        if (auctionResult is null)
        {
            EndAuctionLog.LogAuctionNotFound(_logger, request.AuctionId.Value);
            return Result.Failure<Unit>(AuctionErrors.NotFound);
        }

        var endResult = auctionResult.MarkAsEnded(_dateTimeProvider.Now);
        
        if (endResult.IsFailure)
        {
            EndAuctionLog.LogDomainViolation(_logger, request.AuctionId.Value, endResult.TopError.Message);
            return Result.Failure<Unit>(endResult.TopError);
        }

        _auctionRepository.Update(auctionResult);
        
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        try
        {
            await _auctionStreamService.BroadcastAuctionUpdateAsync(
                BroadcastAuctionUpdateTypes.StatusChanged,
                new AuctionStatusUpdateDto
                {
                    AuctionId = request.AuctionId.Value,
                    Status = AuctionStatus.Ended.ToString(),
                },
                cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to broadcast auction ended event for Auction ID: {AuctionId}", request.AuctionId.Value);
        }
        
        EndAuctionLog.LogAuctionEnded(_logger, request.AuctionId.Value);
        return Result.Success(Unit.Value);
    }
}