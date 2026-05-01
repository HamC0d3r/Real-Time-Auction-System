namespace MazadZone.Domain.Orders;
public enum BidStatus
{
    Leading = 1,  // The current highest bid
    Outbid = 2,   // Surpassed by a higher bid
}