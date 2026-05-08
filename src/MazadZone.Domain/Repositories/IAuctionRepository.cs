using MazadZone.Domain.Auctions;
using MazadZone.Domain.Shared.Interfaces;
using MazadZone.Domain.Users.ValueObjects;

namespace MazadZone.Domain.Repositories;

public interface IAuctionRepository: IGenericRepository<Auction>, IScopedService
{
    Task<int> TerminateAllAuctionsBySellerIdAsync(UserId sellerId, string reason, CancellationToken ct);
    Task<int> CancelAllActiveBySellerIdAsync(Guid sellerId,CancellationToken ct);
    Task<int> RemoveActiveBidsByBidderIdAsync(UserId bidderId, CancellationToken ct);
    Task<Auction?> GetByIdAsync(AuctionId id, CancellationToken cancellationToken = default);
}