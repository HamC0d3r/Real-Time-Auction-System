using MazadZone.Application.Features.Auctions.DTOs;
using MazadZone.Application.Features.Auctions.Enums;
using MazadZone.Application.Services;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Repositories;

namespace MazadZone.Application.Features.Auctions.Commands.CreateAuction;
/// <summary>
/// Handles the creation of a new auction.
/// </summary>
/// <typeparam name="CreateAuctionHandler"></typeparam>
public class CreateAuctionHandler
(
    IAuctionRepository _auctionRepository,
    IUnitOfWork _unitOfWork,
    IAuctionJobScheduler _auctionJobScheduler,
    ILogger<CreateAuctionHandler> _logger,
    IAuctionStreamService _auctionStreamService
) : ICommandHandler<CreateAuctionCommand, AuctionId>
{
    public async Task<Result<AuctionId>> Handle(CreateAuctionCommand request, CancellationToken cancellationToken)
    {
        CreateAuctionLog.LogHandlingCreateAuction(_logger);

        var images = new List<Image>();

        foreach (var image in request.Images)
        {
            var imageResult = Image.Create(image.Path, image.AltText, image.isMain);
            if (imageResult.IsFailure)
            {
                return Result.Failure<AuctionId>(imageResult.TopError);
            }

            images.Add(imageResult.Value);
        }

        var conditionResult = Description.Create(request.Condition);
        if (conditionResult.IsFailure)
        {
            CreateAuctionLog.LogDomainViolation(_logger, conditionResult.TopError.Message);
            return Result.Failure<AuctionId>(conditionResult.TopError);
        }

        var createResult = Auction.Create(
            request.SellerId,
            request.Status,
            conditionResult.Value,
            request.ShippingAddress,
            request.StartBidAmount,
            request.MinBidAmount,
            request.StartTime,
            request.EndTime,
            request.Title,
            request.Description,
            images,
            request.CatigoryId
            );

        if (createResult.IsFailure)
        {
            CreateAuctionLog.LogDomainViolation(_logger, createResult.TopError.Message);
            return Result.Failure<AuctionId>(createResult.TopError);
        }

        var auction = createResult.Value;

        _auctionRepository.Add(auction);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        CreateAuctionLog.LogAuctionCreated(_logger, auction.Id.Value);

        try
        {
            await _auctionStreamService.BroadcastAuctionUpdateAsync(
                BroadcastAuctionUpdateTypes.AuctionCreated,
                new AuctionStatusUpdateDto
                {
                    AuctionId = auction.Id.Value,
                    Status = AuctionStatus.Pending.ToString(),
                },
                cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to broadcast auction created event for Auction ID: {AuctionId}", auction.Id.Value);
        }

        _auctionJobScheduler.ScheduleAuctionStarting(auction.Id.Value, auction.StartTime);
        _auctionJobScheduler.ScheduleAuctionClosing(auction.Id.Value, auction.EndTime);
        CreateAuctionLog.LogJobScheduled(_logger, auction.Id.Value, auction.EndTime);

        return Result.Success(auction.Id);

    }
}