namespace MazadZone.Domain.Auctions;
public static class AuctionErrorCodes
{
    public const string AlreadyEnded = "Auction.AlreadyEnded";
    public const string BidTooLow = "Auction.BidTooLow";
    public const string InvalidStateTransition = "Auction.InvalidStateTransition";
    public const string CannotUpdateActive = "Auction.CannotUpdateActive";
    public const string InvalidTimeFrame = "Auction.InvalidTimeFrame";
    public const string CannotStart = "Auction.CannotStart";
    public const string CannotCancel = "Auction.CannotCancel";
    public const string CannotEnd = "Auction.CannotEnd";
    public const string AlreadyCancelled = "Auction.AlreadyCancelled";
    public const string DepositTooLow = "Auction.DepositTooLow";
    public const string ItemNotLoaded = "Auction.ItemNotLoaded";

public const string MinBidTooLow = "Auction.MinBidTooLow";
    public const string StartBidTooLow = "Auction.StartBidTooLow";


    // Application-level errors related to auction operations can be added here as needed
    public const string NotFound = "Auction.NotFound";

public const string Forbidden = "Auction.Forbidden";
    public const string CannotRelistActive = "Auction.CannotRelistActive";

}

public static class AuctionErrors
{
    public static Error PlaceBidFailed =>
        Error.Conflict(AuctionErrorCodes.BidTooLow, "Place bid failed.");
    public static Error AlreadyEnded =>
        Error.Conflict(AuctionErrorCodes.AlreadyEnded, "This auction has already ended and cannot accept new bids.");

    public static Error BidTooLow =>
        Error.Conflict(AuctionErrorCodes.BidTooLow, "The bid amount must be greater than or equal to the minimum next bid.");

    public static Error InvalidStateTransition =>
        Error.Conflict(AuctionErrorCodes.InvalidStateTransition, "The requested state transition is invalid for the current auction status.");

    public static Error CannotUpdateActive =>
        Error.Conflict(AuctionErrorCodes.CannotUpdateActive, "Cannot update the details of an auction that is no longer pending.");

    public static Error InvalidTimeFrame =>
        Error.Validation(AuctionErrorCodes.InvalidTimeFrame, "The start time must be before the end time.");

    public static Error CannotStart =>
            Error.Conflict(AuctionErrorCodes.CannotStart, "Only pending auctions can be set to active.");

    public static Error CannotCancel =>
        Error.Conflict(AuctionErrorCodes.CannotCancel, "This auction is active, which involves locked funds. It can no longer be cancelled.");

    public static Error CannotEnd =>
        Error.Conflict(AuctionErrorCodes.CannotEnd, "Only active auctions can be set to ended.");

    public static Error AlreadyCancelled =>
        Error.Conflict(AuctionErrorCodes.AlreadyCancelled, "This auction has already been cancelled.");

    public static Error DepositTooLow =>
          Error.Validation(
            AuctionErrorCodes.DepositTooLow,
            "The provided deposit does not meet the minimum requirement to place a bid on this auction."
          );

    public static Error ItemNotLoaded =>
            Error.Validation(
                AuctionErrorCodes.ItemNotLoaded,
                "The associated Item must be loaded from the database to modify its images."
            );

public static readonly Error MinBidTooLow = Error.Validation(
        AuctionErrorCodes.MinBidTooLow,
        "The minimum bid increment must be greater than zero."
    );

    public static readonly Error StartBidTooLow = Error.Validation(
        AuctionErrorCodes.StartBidTooLow,
        "The starting bid amount cannot be negative. Please provide a valid starting amount."
    );

    public static readonly Error NotFound = Error.NotFound(
        AuctionErrorCodes.NotFound,
        "The specified auction was not found."
    );

// Use Forbidden (403) for ownership violations
    public static readonly Error Forbidden = Error.Forbidden(
        AuctionErrorCodes.Forbidden,
        "You do not have permission to modify or relist this auction."
    );

    // Use Conflict (409) because the request is valid, but the state of the entity prevents it
    public static readonly Error CannotRelistActive = Error.Conflict(
        AuctionErrorCodes.CannotRelistActive,
        "An active auction cannot be relisted. It must be ended or cancelled first."
    );

}