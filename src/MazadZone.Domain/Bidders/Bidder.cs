using MazadZone.Domain.Auctions;
using MazadZone.Domain.Entities.Users;

namespace MazadZone.Domain.Bidders;

public sealed class Bidder : AggregateRoot<BidderId>
{
    private Bidder() { } // EF Core constructor

    private Bidder(BidderId id, Address defaultShippingAddress) : base(id)
    {
        DefaultShippingAddress = defaultShippingAddress;
        TotalAmountSpent = Money.Zero(); // Assuming a Money ValueObject
    }

    public Address DefaultShippingAddress { get; private set; }
    public Money TotalAmountSpent { get; private set; }

    // Factory method for a new User completing their Bidder profile
    public static Result<Bidder> CompleteProfile(Guid userId, Address defaultShippingAddress)
    {
        // The BidderId IS the UserId
        var bidderId =  BidderId.Load(userId);
        
        return new Bidder(bidderId, defaultShippingAddress);
    }

    // Bidder-specific domain logic goes here
    public Result UpdateShippingAddress(Address newAddress)
    {
        DefaultShippingAddress = newAddress;
        return Result.Success();
    }
}