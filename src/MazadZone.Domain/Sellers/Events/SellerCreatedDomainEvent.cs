using MazadZone.Domain.Auctions;

namespace MazadZone.Domain.Sellers.Events;

public sealed record SellerCreatedDomainEvent(SellerId SellerId) : IDomainEvent
{
    public Guid Id => Guid.NewGuid();

    public DateTime OccurredOnUtc => DateTime.UtcNow;
}