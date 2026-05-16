using MazadZone.Domain.Auctions;
using MazadZone.Domain.Bidders;

namespace MazadZone.Domain.Repositories;
public interface IBidderRepository : IGenericRepository<Bidder>
{
    Task<string> GetNationalIdByBidderIdAsync(BidderId bidderId, CancellationToken cancellationToken);

}