using MazadZone.Domain.Auctions;

namespace MazadZone.Domain.Bidders.Events;

//  Triggered when the "3 Strikes" rule is hit
public record BidderExceededUnpaidLimitDomainEvent(
    BidderId BidderId) : IDomainEvent
{
    public Guid Id => Guid.NewGuid();

    public DateTime OccurredOnUtc => DateTime.UtcNow;
}