using MazadZone.Application.Features.Sellers.Commands.BecomeSeller;
using MazadZone.Application.Features.Sellers.Commands.UpdateBankDetails;
using MazadZone.Application.Features.Sellers.Commands.Verify;
using MazadZone.Application.Features.Sellers.Queries.GetPrivateDetails;
using MazadZone.Application.Features.Sellers.Queries.GetPublicProfile;
using MazadZone.Application.Features.Sellers.Queries.GetUnverifiedSellers;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Sellers;
using MazadZone.Domain.Users.ValueObjects;

namespace Tests.Application.Features.Sellers;

public static class SellerHelper
{
    /// <summary>
    /// Centralizes the creation of a valid dummy Seller for testing purposes.
    /// </summary>
    public static Seller CreateValidSeller()
    {
        return Seller.BecomeSeller(
            BidderId.New(),
            "Test Bank Account",
            "Test National Id"
        ).Value;
    }

    public static BecomeSellerCommand CreateBecomeSellerCommand()
    {
        return new BecomeSellerCommand(UserId.New(), "JO99ASEB000000123456789");
    }

    public static UpdateBankDetailsCommand CreateUpdateBankDetailsCommand()
    {
        return new UpdateBankDetailsCommand(SellerId.New(), "JO99ASEB000000123456789");

    }

    public static VerifyCommand CreateVerifyCommand()
    {
        return new VerifyCommand(SellerId.New());
    }

    public static GetPrivateSellerDetailsQuery CreateGetPrivateSellerDetailsQuery()
    {
        return new GetPrivateSellerDetailsQuery(SellerId.New());
    }

    /// <summary>
    /// Centralizes the creation of a PrivateSellerDetailsResponse with sensible baseline mock data.
    /// </summary>
    public static PrivateSellerDetailsResponse CreatePrivateSellerDetailsResponse(SellerId? sellerId = null)
    {
        return new PrivateSellerDetailsResponse(
            SellerId: sellerId ?? SellerId.New(),
            BankAccountNumber: "JO99ASEB000000123456789",
            TaxIdentificationNumber: "9991012345",
            IsVerified: true,
            Rating: 4.8m
        );
    }

    public static GetPublicSellerProfileQuery CreateGetPublicSellerProfileQuery() =>
          new GetPublicSellerProfileQuery(SellerId.New());

    /// <summary>
    /// Centralizes the creation of a PublicSellerProfileResponse with sensible baseline mock data.
    /// </summary>
    public static PublicSellerProfileResponse CreatePublicSellerProfileResponse()
    {
        return new PublicSellerProfileResponse(
            SellerId: SellerId.New(),
            Rating: 4.9m,
            ReviewsCount: 120,
            IsVerified: true,
            JoinedOnUtc: DateTime.UtcNow.AddMonths(-6)
        );
    }

    /// <summary>
    /// Centralizes the creation of a mock list containing baseline UnverifiedSellerSummaryResponse records.
    /// </summary>
    public static List<UnverifiedSellerSummaryResponse> CreateUnverifiedSellerSummaries() =>
    [
        new(
            SellerId: Guid.NewGuid(),
            BankAccountNumber: "JO99ASEB000000123456789",
            TaxIdentificationNumber: "9991012345",
            JoinedOnUtc: DateTime.UtcNow.AddDays(-2)
        ),
        new(
            SellerId: Guid.NewGuid(),
            BankAccountNumber: "JO99ASEB888888123456789",
            TaxIdentificationNumber: "9991098765",
            JoinedOnUtc: DateTime.UtcNow.AddHours(-5)
        )
    ];
}