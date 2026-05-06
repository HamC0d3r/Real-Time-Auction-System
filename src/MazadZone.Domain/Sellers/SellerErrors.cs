namespace MazadZone.Domain.Sellers;

public static class SellerErrorCodes
{
    public const string InvalidBankAccount = "Seller.InvalidBank";
    public const string InvalidNationalId = "Seller.InvalidNationalId";
    public const string NotFound = "Seller.NotFound";

}
public static class SellerErrors
{
    public static readonly Error InvalidBankAccount = Error.Validation(
        SellerErrorCodes.InvalidBankAccount,
        "A valid bank account is required to sell.");

    public static readonly Error InvalidNationalId = Error.Validation(
        SellerErrorCodes.InvalidNationalId,
        "A valid national ID is required to sell.");

    public static readonly Error NotFound = Error.NotFound(
        SellerErrorCodes.NotFound,
        "Seller not found.");
}