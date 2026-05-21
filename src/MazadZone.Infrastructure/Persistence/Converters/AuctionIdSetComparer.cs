using MazadZone.Domain.Auctions;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace MazadZone.Infrastructure.Persistence.Converters;

public class AuctionIdSetComparer : ValueComparer<HashSet<AuctionId>>
{
    public AuctionIdSetComparer() : base(
        (c1, c2) => c1!.SequenceEqual(c2!), // Check if lists are the same
        c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())), // Generate hash code
        c => c.ToHashSet() // Take a snapshot
    ) { }
}