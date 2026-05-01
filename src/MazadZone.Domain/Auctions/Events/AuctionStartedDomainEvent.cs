namespace MazadZone.Domain.Auctions.Events;

public sealed record AuctionStartedDomainEvent(AuctionId AuctionId) : IDomainEvent
{
    public Guid Id => Guid.NewGuid();
    public DateTime OccurredOnUtc => DateTime.UtcNow;
}
