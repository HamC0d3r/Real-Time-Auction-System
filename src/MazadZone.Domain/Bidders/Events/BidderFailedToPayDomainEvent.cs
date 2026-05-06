using MazadZone.Domain.Auctions;

namespace MazadZone.Domain.Bidders.Events;

//  Triggered when a bidder wins an auction but fails to pay within the deadline
public record BidderFailedToPayDomainEvent(
    BidderId BidderId,
    AuctionId AuctionId,
    int CurrentUnpaidCount) : IDomainEvent
{
    public Guid Id => Guid.NewGuid();

    public DateTime OccurredOnUtc => DateTime.UtcNow;
}