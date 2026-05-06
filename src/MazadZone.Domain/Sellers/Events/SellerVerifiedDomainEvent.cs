using MazadZone.Domain.Auctions;

namespace MazadZone.Domain.Sellers.Events;

public sealed record SellerVerifiedDomainEvent(SellerId SellerId) : IDomainEvent
{
    public Guid Id => Guid.NewGuid();

    public DateTime OccurredOnUtc => DateTime.UtcNow;
}
