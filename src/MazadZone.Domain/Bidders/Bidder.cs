using MazadZone.Domain.Auctions;
using MazadZone.Domain.Bidders.Events;
using MazadZone.Domain.Common;
using MazadZone.Domain.Entities.Users;

namespace MazadZone.Domain.Bidders;

public sealed class Bidder : AggregateRoot<BidderId>, IAuditableEntity, IVerifiableEntity
{
    public IReadOnlyCollection<AuctionId> UnpaidAuctions => _unpaidAuctions;

    #pragma warning disable CS8618 
    #pragma warning disable CS0519
    private Bidder() { } 
    #pragma warning restore CS8618


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

    public void RecordPaymentSuccess() => SuccessfulPayments++;
    

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
    
    public static Result<Bidder> CompleteProfile(Guid userId,string nationalId, Address defaultShippingAddress)
    {
        var bidderId = BidderId.Load(userId);

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
}