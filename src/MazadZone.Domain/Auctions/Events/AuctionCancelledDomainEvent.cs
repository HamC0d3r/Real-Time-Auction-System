
namespace MazadZone.Domain.Auctions.Events;

// CRITICAL: Triggered when admin cancels. Your background worker listens to this to release ALL authorization holds.
public sealed record AuctionCancelledDomainEvent(AuctionId AuctionId) : IDomainEvent
{
    public Guid Id => Guid.NewGuid();

    public DateTime OccurredOnUtc => DateTime.UtcNow;
}
