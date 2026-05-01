namespace MazadZone.Domain.Auctions;
public static class AuctionConstants
{
    public const int MaxTitleLength = 100;
    public const int MaxDescriptionLength = 1000;
    public const int MaxImagesPerItem = 10;
    public const decimal MinBidIncrement = 1.00m; // Minimum increment for bids
    public const decimal MinDepositAmount = 10.00m; // Minimum deposit required to
public const decimal BidDepositPercentage = 0.10m; // 10% of the bid amount as deposit
    
}