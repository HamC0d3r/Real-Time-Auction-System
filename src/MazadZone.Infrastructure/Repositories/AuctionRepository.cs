using System;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace MazadZone.Infrastructure.Repositories;

public class AuctionRepository : IAuctionRepository
{
    private readonly AppContext _context;

    public AuctionRepository(AppContext context) => _context = context;

    public async Task<Auction?> GetByIdAsync(AuctionId id, CancellationToken cancellationToken = default)
    {
        return await _context.Set<Auction>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public void Add(Auction auction) => _context.Set<Auction>().Add(auction);

    public void Update(Auction auction) => _context.Set<Auction>().Update(auction);

    public void Delete(Auction auction) => _context.Set<Auction>().Remove(auction);
}