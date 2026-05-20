using MazadZone.Domain.Auctions;
using MazadZone.Domain.Repositories;
using MazadZone.Infrastructure.Persistence;

namespace MazadZone.Infrastructure.Repositories;

public class BidRepository : GenericRepository<Bid>, IBidRepository
{
    public BidRepository(AppDbContext context)
        : base(context)
    {
    }

}