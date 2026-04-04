using System.ComponentModel;
using System.Runtime.InteropServices;
using MazadZone.Domain.Auctions.Events;
using MazadZone.Domain.Items;
using MazadZone.Domain.ValueObjects;

namespace MazadZone.Domain.Auctions;

public sealed class Auction : AggregateRoot<AuctionId>, IAuditableEntity
{

    public IReadOnlyCollection<Bid> Bids => _bids.AsReadOnly();

    // EF Core Constructor
    private Auction() { }

    private Auction(
        AuctionId id,
        ItemId itemId,
        SellerId sellerId,
        AddressId shippingAddressId,
        Money startBidAmount,
        Money minBidAmount,
        DateTime startTime,
        DateTime endTime) : base(id)
{

        SellerId = sellerId;
        ItemId = itemId;
        ShippingAddressId = shippingAddressId;
        StartBidAmount = startBidAmount;
        MinBidAmount = minBidAmount;
        StartTime = startTime;
        EndTime = endTime;
        Status = AuctionStatus.Pending; // Default State


        RaiseDomainEvent(new AuctionCreatedDomainEvent(id));
    }

    public ItemId ItemId { get; private set; }
    public SellerId SellerId { get; private set; }
    public AddressId ShippingAddressId { get; private set; }

    public Money StartBidAmount { get; private set; }
    public Money MinBidAmount { get; private set; } // Acts as the minimum increment

    public DateTime StartTime { get; private set; }
    public DateTime EndTime { get; private set; }
    public AuctionStatus Status { get; private set; }

    public DateTime CreatedOnUtc { get; set ; }
    public DateTime? ModifiedOnUtc { get ; set ; }
    private readonly List<Bid> _bids = new();

    // --- Calculated Properties ---
    public Bid? CurrentLeadingBid => _bids.FirstOrDefault(b => b.Status == BidStatus.Leading);

    public Money CurrentHighestBidAmount => CurrentLeadingBid?.Amount ?? StartBidAmount;

    public Money MinNextBidAmount => CurrentHighestBidAmount + MinBidAmount;

    public TimeSpan RemainderTime => EndTime > DateTime.UtcNow ? EndTime - DateTime.UtcNow : TimeSpan.Zero;

    // Both the Status must be Active AND the current time must fall within the boundaries
    public bool IsActive => Status == AuctionStatus.Active && DateTime.UtcNow >= StartTime && DateTime.UtcNow < EndTime;

    public bool IsEnded => Status == AuctionStatus.Ended || DateTime.UtcNow >= EndTime;

    public bool IsPending => Status == AuctionStatus.Pending || StartTime > DateTime.UtcNow;

    // --- Factory Method ---
    public static Result<Auction> Create(
        ItemId itemId,
        SellerId sellerId,
        AddressId shippingAddressId,
        decimal startBidAmount,
        decimal minBidAmount,
        Currency currency,
        DateTime startTime,
        DateTime endTime)
    {
if (startTime >= endTime) return AuctionErrors.InvalidTimeFrame;

var minBidResult = Money.Create(minBidAmount, currency);
        if (minBidResult.IsFailure) return AuctionErrors.MinBidTooLow;

var startBidResult = Money.Create(startBidAmount, currency);
if (startBidResult.IsFailure) return AuctionErrors.StartBidTooLow;


return  new Auction(
            new AuctionId(Guid.NewGuid()),
            itemId,
            sellerId,
            shippingAddressId,
            startBidResult.Value,
            minBidResult.Value,
            startTime,
            endTime);
    }

    // --- Operations (State Machine) ---

    public Result SetAsActive()
    {
        if (IsPending) return AuctionErrors.CannotStart;

        Status = AuctionStatus.Active;

        RaiseDomainEvent(new AuctionStartedDomainEvent(Id));

        return Result.Success();
    }

    public Result SetAsEnded()
    {
        if (!IsActive) return AuctionErrors.CannotEnd;

        Status = AuctionStatus.Ended;
        RaiseDomainEvent(new AuctionEndedDomainEvent(Id));

        return Result.Success();
    }

    public Result SetAsCancelled()
    {
        if (IsPending) return AuctionErrors.CannotCancel;

        Status = AuctionStatus.Cancelled;
        RaiseDomainEvent(new AuctionCancelledDomainEvent(Id));

        return Result.Success();
    }

    public Result SetAsCancelledByAdmin()
    {
        if (Status == AuctionStatus.Cancelled) return AuctionErrors.AlreadyCancelled;

        if(IsEnded) return AuctionErrors.AlreadyEnded;

        Status = AuctionStatus.Cancelled;
        RaiseDomainEvent(new AuctionCancelledDomainEvent(Id));
        return Result.Success();
    }

    // --- Detail Modification ---

    public Result Update(decimal startBid, decimal minBid, DateTime startTime, DateTime endTime)
    {
        // Business Rule: You can only update details BEFORE the auction starts
        if (!IsPending) return AuctionErrors.CannotUpdateActive;

        if (startTime >= endTime) return AuctionErrors.InvalidTimeFrame;

        var startBidResult = Money.Create(startBid, Currency.Jod);
        if (startBidResult.IsFailure) return startBidResult.TopError;

        var minBidResult = Money.Create(minBid, Currency.Jod);
        if(minBidResult.IsFailure) return minBidResult.TopError;

        StartBidAmount = startBidResult.Value;
        MinBidAmount = minBidResult.Value;
        StartTime = startTime;
        EndTime = endTime;

        return Result.Success();
    }

    // --- Bidding Logic ---

    public Result PlaceBid(BidderId bidderId, decimal amount, decimal depositAmount, string authHoldId)
    {
        if (!IsActive) return AuctionErrors.AlreadyEnded;

        var amountResult = Money.Create(amount, Currency.Jod);
        if (amountResult.IsFailure) return BidErrors.InvalidAmount;

        var depositAmountResult = Money.Create(depositAmount, Currency.Jod);
        if (depositAmountResult.IsFailure) return AuctionErrors.DepositTooLow;

        // Business Rule: Deposit must meet the minimum requirement
        // Business Rule: Bid must meet the minimum next bid threshold
        if (amountResult.Value < MinNextBidAmount) return AuctionErrors.BidTooLow;

        // Mark the old leading bid as Outbid
        var previousLeadingBid = CurrentLeadingBid;
        if (previousLeadingBid is not null)
        {
            var outbidResult = previousLeadingBid.SetAsOutbid();
            if (outbidResult.IsFailure) return outbidResult;

            RaiseDomainEvent(new BidderOutbidDomainEvent(Id, previousLeadingBid.Id, previousLeadingBid.AuthorizationHoldId));
        }

        // Create and add the new bid
        var newBid = Bid.Create(this.Id, bidderId, amountResult.Value, depositAmountResult.Value, authHoldId);
        _bids.Add(newBid);

        RaiseDomainEvent(new BidPlacedDomainEvent(Id, newBid.Id, amountResult.Value));

        return Result.Success();
    }



}