
using MazadZone.Domain.Users;
using MazadZone.Domain.ValueObjects;

namespace MazadZone.Domain.Auctions;

public sealed class Bid : Entity<BidId>
{
    // Parameterless constructor for EF Core
    private Bid() { }

    // Private constructor for factory method
    private Bid(
        BidId id,
        AuctionId auctionId,
        UserId bidderId,
        Money amount,
        Money depositAmount,
        string authorizationHoldId = null) : base(id)
    {
        AuctionId = auctionId;
        BidderId = bidderId;
        Amount = amount;
        DepositAmount = depositAmount;
        AuthorizationHoldId = authorizationHoldId;
        Status = BidStatus.Leading; // A new valid bid is always the leading bid initially
        PlacedAtUtc = DateTime.UtcNow;
    }

    // --- Properties ---
    public AuctionId AuctionId { get; private init; }
    public UserId BidderId { get; private init; }
    public Money Amount { get; private init; }
    public Money DepositAmount { get; private init; }
    public string AuthorizationHoldId { get; private set; } // Maybe delete this if we don't need to track it in the domain
    public BidStatus Status { get; private set; }
    public DateTime PlacedAtUtc { get; private init; }

    // --- Factory Method ---
    // INTERNAL: Only the Auction can create a bid.
    internal static Bid Create(
        AuctionId auctionId, 
        UserId bidderId, 
        Money amount, 
        Money depositAmount 
        )
    {
        return new Bid(new BidId(Guid.NewGuid()), auctionId, bidderId, amount, depositAmount);
    }

    // --- Operations ---
    // INTERNAL: Only the Auction can change the status.

    internal Result SetAsOutbid()
    {
        if (Status != BidStatus.Leading) return BidErrors.NotLeading;

        Status = BidStatus.Outbid;
        return Result.Success();
    }

    public Result SetAuthorizationHoldId(string authHoldId)
    {
        // This method can be used if we want to set the AuthorizationHoldId after bid creation, but currently we are setting it during creation.
        this.AuthorizationHoldId = authHoldId;
        return Result.Success();
    }
}


