using MazadZone.Domain.Auctions;
using MazadZone.Domain.Bidders.Events;
using MazadZone.Domain.Common;
using MazadZone.Domain.Shared.ValueObjects;
using MazadZone.Domain.Users.ValueObjects;

namespace MazadZone.Domain.Bidders;

public sealed class Bidder : AggregateRoot<BidderId>, IAuditableEntity, IVerifiableEntity
{
    public IReadOnlyCollection<AuctionId> UnpaidAuctions => _unpaidAuctions;

    private Bidder() { } 
    private Bidder(BidderId id, string nationalId, Address defaultShippingAddress) : base(id)
    {
        DefaultShippingAddress = defaultShippingAddress;
        NationalId = nationalId;
        IsVerified = false;
        TotalAmountSpent = Money.Zero(); 

    }

    public Address DefaultShippingAddress { get; private set; }
    public Money TotalAmountSpent { get; private set; }
    public int TotalWins { get; private set; }
    public int SuccessfulPayments { get; private set; }
    public int UnpaidWins => _unpaidAuctions.Count;
    public Money ActiveBidsTotal { get; private set; } = Money.Zero();

    public bool IsVerified { get; private set; }

    public string NationalId { get; private set; }

    public DateTime CreatedOnUtc { get ; set ; }
    public DateTime? ModifiedOnUtc { get ; set ; }

    private readonly HashSet<AuctionId> _unpaidAuctions = new();

    public void RecordPaymentSuccess(Money amount)
    {
        SuccessfulPayments++;
        TotalAmountSpent += amount;
    }
    

    public void RecordNonPayment(AuctionId auctionId)
    {
        if (!_unpaidAuctions.Add(auctionId)) return;

        RaiseDomainEvent(new BidderFailedToPayDomainEvent(this.Id, auctionId, UnpaidWins));

        if (UnpaidWins >= BidderPolicies.MaxUnpaidWinsThreshold)
            RaiseDomainEvent(new BidderExceededUnpaidLimitDomainEvent(this.Id));
    }

    public Result AddActiveBid(Money amount)
    {
        if (ActiveBidsTotal.Add(amount).Amount > BidderPolicies.DefaultCreditLimit)
            return BidderErrors.CreditLimitReached;

        ActiveBidsTotal = ActiveBidsTotal.Add(amount);
        return Result.Success();
    }
    
    public void ReleaseActiveBid(Money amount)
    {
        ActiveBidsTotal -= amount;
        if (ActiveBidsTotal.Amount < 0) ActiveBidsTotal = Money.Zero();
    }

    public void RecordWin()
    {
        TotalWins++;
    }

    public static Result<Bidder> CompleteProfile(UserId userId,string nationalId, Address defaultShippingAddress)
    {
        var bidderId = BidderId.Load(userId.Value);

        if (defaultShippingAddress is null) return BidderErrors.AddressMissing;

        if(string.IsNullOrWhiteSpace(nationalId)) return BidderErrors.InvalidNationalId;

        var bidder = new Bidder(bidderId,nationalId, defaultShippingAddress);

        bidder.RaiseDomainEvent(new BidderProfileCompletedDomainEvent(bidderId));

        return bidder;
    }

    public Result UpdateShippingAddress(Address newAddress)
    {
        DefaultShippingAddress = newAddress;
        return Result.Success();
    }

    public void Verify()
    {
        IsVerified = true;
        RaiseDomainEvent(new BidderVerifiedDomainEvent(this.Id));
    }
}