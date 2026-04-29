using MazadZone.Domain.Auctions;

namespace MazadZone.Domain.Repositories;

public interface IAuctionRepository
{
    Task<List<Auction>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Auction?> GetByIdAsync(AuctionId id, CancellationToken cancellationToken = default);
    Task AddAsync(Auction auction ,CancellationToken cancellationToken = default);
    Task UpdateAsync(Auction auction , CancellationToken cancellationToken = default);
    Task DeleteAsync(Auction auction , CancellationToken cancellationToken = default);
    Task<List<Bid>> GetAuctionBidsForBidderAsync(BidderId bidderId, CancellationToken cancellationToken);
    Task<List<Bid>> GetPreviousBidsForAuctionByBidderIdAsync(BidderId bidderId, object auctionId, CancellationToken cancellationToken);
}