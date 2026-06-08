namespace MazadZone.Domain.Disputes; // Or MazadZone.Domain.Support

public static class DisputeErrors
{
    public static readonly Error AlreadyResolved = Error.Conflict(
        "Dispute.AlreadyResolved",
        "This dispute has already been resolved and its status cannot be changed.");

    public static readonly Error NotFound = Error.NotFound(
        "Dispute.NotFound",
        "The dispute was not found."
    );

    public static readonly Error OrderHasOpenDispute = Error.Conflict(
        "Dispute.OrderHasOpenDispute",
        "The order already has an open dispute. Please resolve the existing dispute before opening a new one."
    );
}

public static class DisputeErrorCodes
{
    public const string CannotChangeReason = "Dispute.CannotChangeReason";
    public const string AlreadyResolved = "Dispute.AlreadyResolved";
    public const string CannotResolveDispute = "Dispute.CannotResolve";
}


public static class ResolutionErrorCodes
{
    public const string Empty = "Resolution.Empty";
    public const string TooShort = "Resolution.TooShort";
    public const string TooLong = "Resolution.TooLong";
}

public static class ResolutionErrors
{
    public static Error Empty => Error.Validation(ResolutionErrorCodes.Empty, "Resolution text cannot be empty or whitespace.");
    public static Error TooShort => Error.Validation(ResolutionErrorCodes.TooShort, $"Resolution must be at least {OrderConstants.MinResolutionLength} characters long.");
    public static Error TooLong => Error.Validation(ResolutionErrorCodes.TooLong, $"Resolution must be at most {OrderConstants.MaxResolutionLength} characters long.");
}

