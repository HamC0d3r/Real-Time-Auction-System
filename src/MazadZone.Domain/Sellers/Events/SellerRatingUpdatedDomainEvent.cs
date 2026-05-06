using MazadZone.Domain.Auctions;

namespace MazadZone.Domain.Sellers.Events;

public sealed record SellerRatingUpdatedDomainEvent(SellerId SellerId, decimal NewRating) : IDomainEvent
{
    public Guid Id => Guid.NewGuid();

    public DateTime OccurredOnUtc => DateTime.UtcNow;
}