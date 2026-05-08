namespace MazadZone.Domain.Orders;

using MazadZone.Domain.Primitives;

public sealed class Feedback : Entity<FeedbackId>
{
    private Feedback() { }


    private Feedback(OrderId orderId, Rating rating, Comment comment) : base(FeedbackId.New()) // Placeholder ID, will be set by the factory method
    {
        OrderId = orderId;
        Rating = rating;
        Comment = comment;
        CreatedAtUtc = DateTime.UtcNow;
    }

    // --- Properties ---
    public OrderId OrderId { get; private init; }
    public Rating Rating { get; private init; }
    public Comment Comment { get; private init; }
    public Comment? Reply { get; private set; } // Nullable because it happens later
    
    public DateTime CreatedAtUtc { get; private init; }
    public DateTime? RepliedAtUtc { get; private set; }

    // --- Factory Method ---
    // Marked internal so only the Order can create it
    internal static Result<Feedback> Create(OrderId orderId, int rating, string comment)
    {
        if (string.IsNullOrWhiteSpace(comment))
            return OrderErrors.FeedbackCommentEmpty;

       var ratingResult = Rating.Create(rating);
        if (ratingResult.IsFailure) return ratingResult.TopError;

      var commentResult = Comment.Create(comment);
        if (commentResult.IsFailure) return commentResult.TopError;


        return Result.Success(new Feedback(orderId, ratingResult.Value, commentResult.Value));
    }

    // --- Operations ---
    // Marked internal so only the Order can trigger a reply
    internal Result AddReply(string replyText)
    {
        if (string.IsNullOrWhiteSpace(replyText)) return FeedbackErrors.EmptyReply;

        if (Reply is not null) return FeedbackErrors.AlreadyReplied;

        var replayResult = Comment.Create(replyText);
        if (replayResult.IsFailure) return replayResult.TopError;

        Reply = replayResult.Value;
        RepliedAtUtc = DateTime.UtcNow;

        return Result.Success();
    }
}