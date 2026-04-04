
namespace MazadZone.Domain.Auctions.Events;

// CRITICAL: Triggered when time is up. Your background worker listens to this to capture the winner's payment!
public sealed record AuctionEndedDomainEvent(AuctionId AuctionId) : IDomainEvent
{
    public Guid Id => Guid.NewGuid();

    public DateTime OccurredOnUtc => DateTime.UtcNow;
}
