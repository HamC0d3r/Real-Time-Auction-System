namespace MazadZone.Domain.Orders;

public static class DisputeErrorCodes
{
    public const string CannotChangeReason = "Dispute.CannotChangeReason";
    public const string AlreadyResolved = "Dispute.AlreadyResolved";
    public const string CannotResolveDispute = "Dispute.CannotResolve";
}


public static class DisputeErrors
{
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
    public static Error TooShort => Error.Validation(ResolutionErrorCodes.TooShort, $"Resolution must be at least {Resolution.MinLength} characters long.");
    public static Error TooLong => Error.Validation(ResolutionErrorCodes.TooLong, $"Resolution");
}

