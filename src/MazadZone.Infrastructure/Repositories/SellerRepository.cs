using MazadZone.Domain.Auctions;
using MazadZone.Domain.Repositories;
using MazadZone.Domain.Sellers;
using MazadZone.Infrastructure.Persistence;

namespace MazadZone.Infrastructure.Repositories;
public class SellerRepository : GenericRepository<Seller>, ISellerRepository
{
    private readonly AppDbContext _context;
    public SellerRepository(AppDbContext context) : base(context)
    {
        
    }

    public Task<Seller?> GetByAuctionIdAsync(AuctionId auctionId, CancellationToken ct)
    {
        throw new NotImplementedException();
    }
}