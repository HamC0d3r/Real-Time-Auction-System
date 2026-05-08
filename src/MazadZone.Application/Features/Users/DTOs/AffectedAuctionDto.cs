using MazadZone.Domain.Users.ValueObjects;

namespace MazadZone.Application.Features.Users.Commands.Ban.Models;

public record AffectedAuctionDto
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public Guid SellerId { get; init; } 
    
    // We use a HashSet to ensure we don't notify the same bidder twice 
    // if they had multiple bids on the same auction.
    public HashSet<Guid> OtherBidderIds { get; init; } = new();
}