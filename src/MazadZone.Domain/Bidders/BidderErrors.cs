namespace MazadZone.Domain.Bidders;

public static class BidderErrorCodes
{
    public const string NotFound = "Bidder.NotFound";
    public const string AlreadyExists = "Bidder.AlreadyExists";
    public const string CreditLimitReached = "Bidder.CreditLimit";
    public const string AddressMissing = "Bidder.AddressMissing";
public const string InvalidNationalId = "Bidder.InvalidNationalId";
}
public static class BidderErrors
{
    public static Error NotFound => Error.NotFound(
        BidderErrorCodes.NotFound,
        "Bidder not found");

    public static readonly Error AlreadyExists =
           Error.Conflict(
           BidderErrorCodes.AlreadyExists,
           "A bidder profile already exists for this user.");

    public static readonly Error CreditLimitReached = Error.Conflict(
        BidderErrorCodes.CreditLimitReached,
        "You have reached your maximum limit of active, unsettled bids.");

    public static readonly Error AddressMissing = Error.Validation(
        BidderErrorCodes.AddressMissing,
        "A verified shipping address is required to bid on physical items.");

    public static readonly Error InvalidNationalId = Error.Validation(
        BidderErrorCodes.InvalidNationalId,
        "A valid national ID is required to bid.");

}