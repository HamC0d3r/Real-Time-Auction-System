using MazadZone.Domain.Bidders;
using MazadZone.Domain.Repositories;
using MazadZone.Infrastructure.Persistence;

namespace MazadZone.Infrastructure.Repositories;

public class BidderRepository : GenericRepository<Bidder>, IBidderRepository
{
    private readonly AppDbContext _context;

    public BidderRepository(AppDbContext context) : base(context)
    {
        _context = context;
        
    }

    public Task<string?> GetNationalIdByBidderIdAsync(BidderId bidderId, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}