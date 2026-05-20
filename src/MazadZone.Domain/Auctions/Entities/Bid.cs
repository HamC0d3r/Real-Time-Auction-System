
using MazadZone.Domain.Bidders;
using MazadZone.Domain.Auctions.Enums;

namespace MazadZone.Domain.Auctions;

public sealed class Bid : Entity<BidId>
{
    // Parameterless constructor for EF Core
    private Bid() { }

    // Private constructor for factory method
    private Bid(
        BidId id,
        BidderId bidderId,
        Money amount,
        Money depositAmount,
        string gatewayAuthHoldId
        ) : base(id)
    {
        BidderId = bidderId;
        Amount = amount;
        DepositAmount = depositAmount;
        GatewayAuthHoldId = gatewayAuthHoldId;
        Status = BidStatus.Leading; // A new valid bid is always the leading bid initially
        PlacedAtUtc = DateTime.UtcNow;
    }

    // --- Properties ---
    
    public BidderId BidderId { get; private init; }
    public Money Amount { get; private init; }
    public Money DepositAmount { get; private init; }
    public BidStatus Status { get; private set; }
    public DateTime PlacedAtUtc { get; private init; }
    public string GatewayAuthHoldId { get; private init; } // Store the payment gateway's authorization hold ID for the deposit

    // --- Factory Method ---
    // INTERNAL: Only the Auction can create a bid.
    internal static Bid Create(
        BidderId bidderId, 
        Money amount, 
        Money depositAmount,
        string? gatewayAuthHoldId)
    {
        return new Bid(BidId.New(), bidderId, amount, depositAmount , gatewayAuthHoldId);
    }

    // --- Operations ---
    // INTERNAL: Only the Auction can change the status.

    internal Result MarkAsOutbid()
    {
        if (Status != BidStatus.Leading) return BidErrors.NotLeading;

        Status = BidStatus.Outbid;
        return Result.Success();
    }

    internal Result MarkAsLeading()
    {
        Status = BidStatus.Leading;
        
        return Result.Success();
    }

}


