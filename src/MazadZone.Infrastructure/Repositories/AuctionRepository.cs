using System;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Orders;
using MazadZone.Domain.Repositories;
using MazadZone.Domain.Shared.ValueObjects;
using MazadZone.Domain.Users.ValueObjects;
using MazadZone.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace MazadZone.Infrastructure.Repositories;

public class AuctionRepository : GenericRepository<Auction>, IAuctionRepository
{
    private readonly AppDbContext _context;

    public AuctionRepository(AppDbContext context) : base(context)
     {
        _context = context;
    }  

    public async Task<Auction?> GetByIdAsync(AuctionId id, CancellationToken cancellationToken = default)
    {
        return await _context.Set<Auction>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<int> CancelAllActiveBySellerIdAsync(
        Guid sellerId,
        //  string reason,
        CancellationToken ct)
    {
        return await _context.Auctions
        .Where(a => a.SellerId.Value == sellerId && a.Status == AuctionStatus.Active)
        .ExecuteUpdateAsync(s => s
            .SetProperty(a => a.Status, AuctionStatus.Cancelled),
        // .SetProperty(a => a.CancellationReason, reason)
        ct);
    }


    public async Task<int> TerminateAllAuctionsBySellerIdAsync(UserId sellerId, string reason, CancellationToken ct)
    {
        var nonFinalStates = new[] {
            AuctionStatus.Active,
            AuctionStatus.Pending,
        };

        return await _context.Auctions
            .Where(a => a.SellerId == sellerId.Value && nonFinalStates.Contains(a.Status))
            .ExecuteUpdateAsync(s => s
                .SetProperty(a => a.Status, AuctionStatus.Cancelled)
                .SetProperty(a => a.CancellationReason, Reason.Create($"Seller Banned: {reason}").Value),
            ct);
    }

    public Task<int> RemoveActiveBidsByBidderIdAsync(UserId bidderId, CancellationToken ct)
    {
        throw new NotImplementedException();
         // var auctions = await _context.Auctions
    //     .Include(a => a.Bids)
    //     .Where(a => a.Bids.Any(b => b.BidderId == bidderId.Value && a.Status == AuctionStatus.Active))
    //     .ToListAsync(ct);

    // int removedCount = 0;

    // foreach (var auction in auctions)
    // {
    //     var bidsToRemove = auction.Bids.Where(b => b.BidderId == bidderId.Value).ToList();

    //     foreach (var bid in bidsToRemove)
    //     {
    //         bid.
    //         removedCount++;
    //     }
    // }

    // if (removedCount > 0)
    // {
    //     await _context.SaveChangesAsync(ct);
    // }

    // return removedCount;
    }
}