namespace MazadZone.Domain.Sellers;

public static class SellerErrorCodes
{
    public const string InvalidBankAccount = "Seller.InvalidBank";


}
public static class SellerErrors
{
    public static readonly Error InvalidBankAccount = Error.Validation(
        SellerErrorCodes.InvalidBankAccount,
        "A valid bank account is required to sell.");
}