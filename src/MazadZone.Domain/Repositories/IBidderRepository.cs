using MazadZone.Domain.Auctions;
using MazadZone.Domain.Bidders;
using MazadZone.Domain.Shared.Interfaces;

namespace MazadZone.Domain.Repositories;
public interface IBidderRepository : IGenericRepository<Bidder> , IScopedService
{
    Task<string?> GetNationalIdByBidderIdAsync(BidderId bidderId, CancellationToken cancellationToken);

}