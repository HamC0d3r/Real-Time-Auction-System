using MazadZone.Domain.Auctions;
using MazadZone.Domain.Common;
using MazadZone.Domain.Sellers.Events;

namespace MazadZone.Domain.Sellers;

public sealed class Seller : AggregateRoot<SellerId>, IVerifiableEntity
{

    #pragma warning disable CS8618 
    #pragma warning disable CS0519
    private Seller() { } 
    #pragma warning restore CS8618

    private Seller(
        SellerId id, 
        string bankAccountNumber, 
        string nationalId,
        string taxId = null) : base(id)
    {
        BankAccountNumber = bankAccountNumber;
        TaxIdentificationNumber = taxId;
        NationalId = nationalId;
        Rating = 0;
        ReviewsCount = 0;
        IsVerified = false;

        RaiseDomainEvent(new SellerCreatedDomainEvent(Id));
    }

    public string BankAccountNumber { get; private set; }
    public string? TaxIdentificationNumber { get; private set; }
    public decimal Rating { get; private set; }
    public int ReviewsCount { get; private set; }

    public DateTime CreatedOnUtc { get ; set ; }
    public DateTime? ModifiedOnUtc { get ; set ; }

    public string NationalId { get; set;}
    public bool IsVerified { get; private set; }

    // Domain Logic: Update rating based on a new review
    public void UpdateRating(int newReviewRating)
    {
        // Simple moving average logic
        Rating = ((Rating * ReviewsCount) + newReviewRating) / (ReviewsCount + 1);
        ReviewsCount++;

        RaiseDomainEvent(new SellerRatingUpdatedDomainEvent(Id, Rating));
    }

    public void Verify()
    {
        IsVerified = true;
        RaiseDomainEvent(new SellerVerifiedDomainEvent(Id));
    }

    // Logic: Updating banking info (triggers a re-verification check usually)
    public Result UpdateBankDetails(string newAccountNumber)
    {
        if (string.IsNullOrWhiteSpace(newAccountNumber)) return SellerErrors.InvalidBankAccount;

        BankAccountNumber = newAccountNumber;
        IsVerified = false; // Reset verification if banking changes

        return Result.Success();
    }

    public static Result<Seller> BecomeSeller(BidderId bidderId, string bankAccountNumber, string nationalId)
    {
        if (string.IsNullOrWhiteSpace(bankAccountNumber))
            return SellerErrors.InvalidBankAccount;

        if(string.IsNullOrWhiteSpace(nationalId))
            return SellerErrors.InvalidNationalId;


        var sellerId = SellerId.Load(bidderId.Value); 
        
        return new Seller(sellerId, bankAccountNumber, nationalId);
    }
}