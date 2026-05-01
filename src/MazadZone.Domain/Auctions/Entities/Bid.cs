
namespace MazadZone.Domain.Auctions;

public sealed class Bid : Entity<BidId>
{
    // Parameterless constructor for EF Core
    private Bid() { }

    // Private constructor for factory method
    private Bid(
        BidId id,
        AuctionId auctionId,
        BidderId bidderId,
        Money amount,
        Money depositAmount) : base(id)
    {
        AuctionId = auctionId;
        BidderId = bidderId;
        Amount = amount;
        DepositAmount = depositAmount;
        Status = BidStatus.Leading; // A new valid bid is always the leading bid initially
        PlacedAtUtc = DateTime.UtcNow;
    }

    // --- Properties ---
    public AuctionId AuctionId { get; private init; }
    public BidderId BidderId { get; private init; }
    public Money Amount { get; private init; }
    public Money DepositAmount { get; private init; }
    public BidStatus Status { get; private set; }
    public DateTime PlacedAtUtc { get; private init; }

    // --- Factory Method ---
    // INTERNAL: Only the Auction can create a bid.
    internal static Bid Create(
        AuctionId auctionId, 
        BidderId bidderId, 
        Money amount, 
        Money depositAmount)
    {
        return new Bid(BidId.New(), auctionId, bidderId, amount, depositAmount);
    }

    // --- Operations ---
    // INTERNAL: Only the Auction can change the status.

    internal Result SetAsOutbid()
    {
        if (Status != BidStatus.Leading) return BidErrors.NotLeading;

        Status = BidStatus.Outbid;
        return Result.Success();
    }

}


