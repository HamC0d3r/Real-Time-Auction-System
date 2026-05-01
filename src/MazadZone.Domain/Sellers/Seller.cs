using MazadZone.Domain.Auctions;

namespace MazadZone.Domain.Sellers;

public sealed class Seller : AggregateRoot<SellerId>
{

    #pragma warning disable CS8618 
    #pragma warning disable CS0519
    private Seller() { } 
    #pragma warning restore CS8618

    private Seller(SellerId id, string bankAccountNumber) : base(id)
    {
        BankAccountNumber = bankAccountNumber;
        SellerRating = 0;
    }

    public string BankAccountNumber { get; private set; }
    public int SellerRating { get; private set; }


    public static Result<Seller> BecomeSeller(BidderId bidderId, string bankAccountNumber)
    {
        if (string.IsNullOrWhiteSpace(bankAccountNumber))
            return SellerErrors.InvalidBankAccount;

        // The SellerId uses the exact same Guid as the Bidder/User
        var sellerId =  SellerId.Load(bidderId.Value); 
        
        return new Seller(sellerId, bankAccountNumber);
    }
}