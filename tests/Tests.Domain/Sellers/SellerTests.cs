using MazadZone.Domain.Auctions; 
using MazadZone.Domain.Sellers;
using MazadZone.Domain.Sellers.Events;
using Shouldly;

namespace Tests.Domain.Sellers;

public class SellerTests
{
    #region Factory Method: BecomeSeller

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void BecomeSeller_BankAccountIsInvalid_ReturnsInvalidBankAccountError(string? invalidBankAccount)
    {
        // Arrange
        var bidderId = BidderId.New();
        var nationalId = "9991012345";

        // Act
        var result = Seller.BecomeSeller(bidderId, invalidBankAccount, nationalId);

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(SellerErrors.InvalidBankAccount);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void BecomeSeller_NationalIdIsInvalid_ReturnsInvalidNationalIdError(string? invalidNationalId)
    {
        // Arrange
        var bidderId = BidderId.New();
        var bankAccount = "JO99ASEB000000123456789";

        // Act
        var result = Seller.BecomeSeller(bidderId, bankAccount, invalidNationalId);

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(SellerErrors.InvalidNationalId);
    }

    [Fact]
    public void BecomeSeller_ValidInputs_CreatesSellerAndRaisesSellerCreatedDomainEvent()
    {
        // Arrange
        var bidderId = BidderId.New();
        var bankAccount = "JO99ASEB000000123456789";
        var nationalId = "9991012345";

        // Act
        var result = Seller.BecomeSeller(bidderId, bankAccount, nationalId);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        
        var seller = result.Value;
        seller.Id.Value.ShouldBe(bidderId.Value);
        seller.BankAccountNumber.ShouldBe(bankAccount);
        seller.NationalId.ShouldBe(nationalId);
        seller.IsVerified.ShouldBeFalse();
        seller.Rating.ShouldBe(0);
        seller.ReviewsCount.ShouldBe(0);

        // Verify Domain Event
        var domainEvents = seller.DomainEvents;
        domainEvents.Count.ShouldBe(1);
        var createdEvent = domainEvents.First().ShouldBeOfType<SellerCreatedDomainEvent>();
        createdEvent.SellerId.ShouldBe(seller.Id);
    }

    #endregion

    #region Method: UpdateBankDetails

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void UpdateBankDetails_NewAccountIsInvalid_ReturnsInvalidBankAccountError(string invalidBankAccount)
    {
        // Arrange
        var seller = CreateValidSeller();

        // Act
        var result = seller.UpdateBankDetails(invalidBankAccount);

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(SellerErrors.InvalidBankAccount);
    }

    [Fact]
    public void UpdateBankDetails_ValidAccount_UpdatesAccountAndRevokesVerificationStatus()
    {
        // Arrange
        var seller = CreateValidSeller();
        seller.Verify(); // Force it to be verified first to test the reset logic
        seller.ClearDomainEvents(); // Clear the verification event

        var newAccount = "JO99ASEB888888123456789";

        // Act
        var result = seller.UpdateBankDetails(newAccount);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        seller.BankAccountNumber.ShouldBe(newAccount);
        
        // Critical Business Rule: Changing financial details revokes verification status
        seller.IsVerified.ShouldBeFalse(); 
    }

    #endregion

    #region Method: Verify

    [Fact]
    public void Verify_ValidSeller_SetsVerifiedFlagAndRaisesSellerVerifiedDomainEvent()
    {
        // Arrange
        var seller = CreateValidSeller();
        seller.ClearDomainEvents(); // Clear creation event

        // Act
        seller.Verify();

        // Assert
        seller.IsVerified.ShouldBeTrue();

        // Verify Domain Event
        var domainEvents = seller.DomainEvents;
        domainEvents.Count.ShouldBe(1);
        var verifiedEvent = domainEvents.First().ShouldBeOfType<SellerVerifiedDomainEvent>();
        verifiedEvent.SellerId.ShouldBe(seller.Id);
    }

    #endregion

    #region Method: UpdateRating

    [Fact]
    public void UpdateRating_ValidStarRatings_CalculatesMovingAverageAndRaisesSellerRatingUpdatedDomainEvents()
    {
        // Arrange
        var seller = CreateValidSeller();
        seller.ClearDomainEvents();

        // Act & Assert 1: First Review (5 stars)
        // Math: ((0 * 0) + 5) / (0 + 1) = 5
        seller.UpdateRating(5);
        seller.Rating.ShouldBe(5m);
        seller.ReviewsCount.ShouldBe(1);

        // Act & Assert 2: Second Review (3 stars)
        // Math: ((5 * 1) + 3) / (1 + 1) = 4
        seller.UpdateRating(3);
        seller.Rating.ShouldBe(4m);
        seller.ReviewsCount.ShouldBe(2);

        // Act & Assert 3: Third Review (1 star)
        // Math: ((4 * 2) + 1) / (2 + 1) = 3
        seller.UpdateRating(1);
        seller.Rating.ShouldBe(3m);
        seller.ReviewsCount.ShouldBe(3);

        // Verify Domain Events
        var domainEvents = seller.DomainEvents;
        domainEvents.Count.ShouldBe(3); // One event for each update
        
        var latestEvent = domainEvents.Last().ShouldBeOfType<SellerRatingUpdatedDomainEvent>();
        latestEvent.SellerId.ShouldBe(seller.Id);
        latestEvent.NewRating.ShouldBe(3m);
    }

    #endregion

    // --- Helpers ---
    private static Seller CreateValidSeller()
    {
        return Seller.BecomeSeller(
            BidderId.New(), 
            "JO99ASEB000000123456789", 
            "9991012345").Value;
    }
}