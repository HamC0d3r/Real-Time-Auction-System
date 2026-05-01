namespace MazadZone.Domain.Auctions;

public enum AuctionStatus
{
    Pending = 1,    // Created, but not yet started
    Active = 2,     // Currently accepting bids
    Ended = 3,
    Cancelled = 4   // Cancelled by admin or seller
}