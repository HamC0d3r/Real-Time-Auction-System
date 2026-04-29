
using MazadZone.Domain.Users;
using MazadZone.Domain.ValueObjects;

namespace MazadZone.Domain.Auctions.Events;

// Triggered for real-time SignalR updates to update the frontend UI for other bidders
public sealed record BidPlacedDomainEvent(AuctionId AuctionId, BidId BidId, UserId BidderId, Money Amount) : IDomainEvent
{
    public Guid Id => Guid.NewGuid();

    public DateTime OccurredOnUtc => DateTime.UtcNow;
}
