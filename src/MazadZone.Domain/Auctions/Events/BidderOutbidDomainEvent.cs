
namespace MazadZone.Domain.Auctions.Events;

// CRITICAL: Triggered to release the hold on the loser's credit card immediately
public sealed record BidderOutbidDomainEvent(AuctionId AuctionId, BidId OutbidBidId) : IDomainEvent
{
    public Guid Id => Guid.NewGuid();

    public DateTime OccurredOnUtc => DateTime.UtcNow;
}