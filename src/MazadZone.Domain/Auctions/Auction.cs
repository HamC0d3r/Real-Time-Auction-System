
using System.Runtime;
using MazadZone.Domain.Auctions.Events;
using MazadZone.Domain.Auctions.ValueObjects;
using MazadZone.Domain.Sellers;
using MazadZone.Domain.Shared.ValueObjects;
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
        Address shippingAddress,
        Money startBidAmount,
        Money minBidAmount,
        DateTime startTime,
        DateTime endTime) : base(id)
{

        SellerId = sellerId;
        ItemId = itemId;
        ShippingAddress = shippingAddress;
        StartBidAmount = startBidAmount;
        MinBidAmount = minBidAmount;
        StartTime = startTime;
        EndTime = endTime;
        Status = AuctionStatus.Pending; // Default State


        RaiseDomainEvent(new AuctionCreatedDomainEvent(id));
    }

    public ItemId ItemId { get; private set; }
    public SellerId SellerId { get; private set; }
    public Address ShippingAddress   { get; private set; }

    public Money StartBidAmount { get; private set; }
    public Money MinBidAmount { get; private set; } // Acts as the minimum increment

    public DateTime StartTime { get; private set; }
    public DateTime EndTime { get; private set; }
    public AuctionStatus Status { get; private set; }

    public DateTime CreatedOnUtc { get; set ; }
    public DateTime? ModifiedOnUtc { get ; set ; }
    private readonly List<Bid> _bids = new();

    public Reason? CancellationReason { get; private set; } = null;
    

    // --- Calculated Properties ---
    public Bid? CurrentLeadingBid => _bids.FirstOrDefault(b => b.Status == BidStatus.Leading);
    public Money CurrentHighestBidAmount => CurrentLeadingBid?.Amount ?? StartBidAmount;

    public Money MinNextBidAmount => CurrentHighestBidAmount + MinBidAmount;

    public int TotalBids => _bids.Count;

    public bool HasBids => _bids.Any();

    

    public TimeSpan GetRemainderTime(DateTime utcNow) =>
        EndTime > utcNow
            ? EndTime - utcNow
            : TimeSpan.Zero;
    // Both the Status must be Active AND the current time must fall within the boundaries
    public bool IsActive(DateTime utcNow) =>
        Status == AuctionStatus.Active &&
        utcNow >= StartTime &&
        utcNow < EndTime;
    public bool IsEnded => Status == AuctionStatus.Ended;

    public bool IsPending(DateTime utcNow) =>
        Status == AuctionStatus.Pending &&
        utcNow < StartTime;
        
    // --- Factory Method ---
    public static Result<Auction> Create(
        ItemId itemId,
        SellerId sellerId,
        Address shippingAddress,
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


        return new Auction(
                AuctionId.New(),
                itemId,
                sellerId,
                shippingAddress,
                startBidResult.Value,
                minBidResult.Value,
                startTime,
                endTime);
    }

    // --- Operations (State Machine) ---

    public Result MarkAsActive(DateTime utcNow)
    {
        if (!IsPending(utcNow))
            return AuctionErrors.CannotStart;

        Status = AuctionStatus.Active;

        RaiseDomainEvent(new AuctionStartedDomainEvent(Id));

        return Result.Success();
    }

    public Result MarkAsEnded(DateTime utcNow)
    {
        if (!IsActive(utcNow))
            return AuctionErrors.CannotEnd;

        Status = AuctionStatus.Ended;

        RaiseDomainEvent(new AuctionEndedDomainEvent(Id));

        return Result.Success();
    }

    public Result MarkAsCancelled(DateTime utcNow)
    {
        if (Status == AuctionStatus.Cancelled) return AuctionErrors.AlreadyCancelled;

        if (IsPending(utcNow)) return AuctionErrors.CannotCancel;

        Status = AuctionStatus.Cancelled;
        RaiseDomainEvent(new AuctionCancelledDomainEvent(Id));

        return Result.Success();
    }

    public Result MarkAsCancelledByAdmin()
    {
        if (Status == AuctionStatus.Cancelled) return AuctionErrors.AlreadyCancelled;

        if(IsEnded) return AuctionErrors.AlreadyEnded;

        Status = AuctionStatus.Cancelled;
        RaiseDomainEvent(new AuctionCancelledDomainEvent(Id));
        return Result.Success();
    }

    // --- Detail Modification ---

        public Result Update(
            decimal startBid,
            decimal minBid,
            DateTime startTime,
            DateTime endTime,
            DateTime utcNow)    
        {
        // Business Rule: You can only update details BEFORE the auction starts
        if (!IsPending(utcNow)) return AuctionErrors.CannotUpdateActive;

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
    public Result<Bid> CheckPlaceBid(
    BidderId bidderId,
    Money amount,
    DateTime utcNow)
    {
        if (!IsActive(utcNow)) 
            return AuctionErrors.AlreadyEnded;

        var amountResult = Money.Create(amount.Amount, Currency.Jod);
        
        if (amountResult.IsFailure) return 
            BidErrors.InvalidAmount;
        

        var depositAmountResult = Money.Create(amount.Amount * AuctionConstants.BidDepositPercentage, 
                            Currency.Jod);
        
        if (depositAmountResult.IsFailure) 
            return AuctionErrors.DepositTooLow;

        // Business Rule: Deposit must meet the minimum requirement
        // Business Rule: Bid must meet the minimum next bid threshold
        if (amountResult.Value < MinNextBidAmount) 
            return AuctionErrors.BidTooLow;
        
        // Create and add the new bid
        var newBid = Bid.Create(this.Id, bidderId, amount, depositAmountResult.Value, null);
        

        return Result.Success(newBid);
    }

    public Result<Bid> PlaceVerifiedBid(
    Bid newBid,
    string authId,
    DateTime utcNow)
    {
        if (!IsActive(utcNow)) 
            return AuctionErrors.AlreadyEnded;
        
        var previousLeadingBid = CurrentLeadingBid;

        if (CurrentLeadingBid is not null)
        {
            CurrentLeadingBid.MarkAsOutbid();
        }

        _bids.Add(newBid);

        newBid.MarkAsLeading();

        if (previousLeadingBid is not null)
        {
            RaiseDomainEvent(
                new BidderOutbidDomainEvent(
                    Id,
                    previousLeadingBid.Id,
                    previousLeadingBid.BidderId,
                    previousLeadingBid.Amount));
        }        

        RaiseDomainEvent(new BidPlacedDomainEvent(Id, newBid.Id));

        return newBid;
    }


}