namespace MazadZone.Domain.Auctions;

public static class BidErrorCodes
{
    public const string NotLeading = "Bid.NotLeading";
    public const string InvalidAmount = "Bid.InvalidAmount";
}

public static class BidErrors
{
    public static Error NotLeading =>
        Error.Conflict(
            BidErrorCodes.NotLeading,
            "Only the currently leading bid can be marked as outbid.");

    public static Error InvalidAmount =>
    Error.Validation(
         BidErrorCodes.InvalidAmount,
         "Bid Amount Cannot be negative value");
}