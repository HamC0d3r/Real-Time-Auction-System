using MazadZone.Domain.Auctions;

namespace MazadZone.Domain.Bidders.Events;

public record BidderProfileCompletedDomainEvent(
    BidderId BidderId) : IDomainEvent
{
    public Guid Id => Guid.NewGuid();

    public DateTime OccurredOnUtc => DateTime.UtcNow;
}
