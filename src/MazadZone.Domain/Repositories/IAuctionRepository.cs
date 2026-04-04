using MazadZone.Domain.Auctions;

namespace MazadZone.Domain.Repositories;

public interface IAuctionRepository
{
    Task<Auction?> GetByIdAsync(AuctionId id, CancellationToken cancellationToken = default);
    Task AddAsync(Auction auction);
    void Update(Auction auction);
    void Delete(Auction auction);
}