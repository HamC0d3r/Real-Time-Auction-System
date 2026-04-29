
namespace MazadZone.Domain.Auctions.Events;

// Triggered when an auction officially opens (Good for sending push notifications to watchers)
public sealed record AuctionStartedDomainEvent(
    AuctionId AuctionId) : IDomainEvent
{
    public Guid Id => Guid.NewGuid();
    public DateTime OccurredOnUtc => DateTime.UtcNow;
}
