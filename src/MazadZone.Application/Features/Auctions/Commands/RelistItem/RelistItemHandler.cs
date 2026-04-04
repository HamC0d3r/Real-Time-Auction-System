using MazadZone.Application.Features.Auctions.RelistItem;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Orders;
using MazadZone.Domain.Repositories;
using MazadZone.Domain.ValueObjects;

namespace MazadZone.Application.Features.Auctions.Commands.RelistItem;

public sealed class RelistItemHandler : IRequestHandler<RelistItemCommand, Result<Guid>>
{
    private readonly IAuctionRepository _auctionRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RelistItemHandler(IAuctionRepository auctionRepository, IUnitOfWork unitOfWork)
    {
        _auctionRepository = auctionRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Guid>> Handle(RelistItemCommand request, CancellationToken ct)
    {
        var oldAuction = await _auctionRepository.GetByIdAsync(new AuctionId(request.OldAuctionId), ct);
        
        if (oldAuction is null) return Result.Failure<Guid>(AuctionErrors.NotFound);

        if (oldAuction.SellerId.Value != request.SellerId) return AuctionErrors.Forbidden;
        
        // Logic check: Only unsold/ended auctions should be relisted
        if (oldAuction.IsActive) return AuctionErrors.CannotRelistActive;

        // Create a BRAND NEW auction using the SAME ItemId from the old one
        var relistResult = Auction.Create(
            oldAuction.ItemId,
            oldAuction.SellerId,
            oldAuction.ShippingAddressId,
            request.NewStartBid,
            oldAuction.MinBidAmount.Amount, // Keep the same increment rules
            Currency.Jod,
            request.NewStart,
            request.NewEnd);

        if (relistResult.IsFailure) return relistResult.TopError;

        await _auctionRepository.AddAsync(relistResult.Value);
        await _unitOfWork.SaveChangesAsync(ct);

        return Result.Success(relistResult.Value.Id.Value);
    }
}