namespace MazadZone.Domain.Orders;


public static class FeedbackErrorCodes
{
    public const string EmptyReply = "Feedback.EmptyReply";
    public const string AlreadyReplied = "Feedback.AlreadyReplied";
}

public static class FeedbackErrors
{
    public static Error EmptyReply =>
        Error.Validation(
            FeedbackErrorCodes.EmptyReply, 
            "The reply text cannot be empty or whitespace.");

    public static Error AlreadyReplied =>
        Error.Conflict(
            FeedbackErrorCodes.AlreadyReplied, 
            "A reply has already been submitted for this feedback and cannot be overwritten.");
}