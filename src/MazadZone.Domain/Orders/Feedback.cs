namespace MazadZone.Domain.Orders;

using MazadZone.Domain.Primitives;

public sealed class Feedback : Entity<FeedbackId>
{
    // Parameterless constructor for EF Core
    private Feedback() { }

    private Feedback(OrderId orderId, Rating rating, string comment) : base(new FeedbackId(0)) // Placeholder ID, will be set by the factory method
    {
        OrderId = orderId;
        Rating = rating;
        Comment = comment;
        CreatedAtUtc = DateTime.UtcNow;
    }

    // --- Properties ---
    public OrderId OrderId { get; private init; }
    public Rating Rating { get; private init; }
    public string Comment { get; private init; }
    public string? Reply { get; private set; } // Nullable because it happens later
    
    public DateTime CreatedAtUtc { get; private init; }
    public DateTime? RepliedAtUtc { get; private set; }

    // --- Factory Method ---
    // Marked internal so only the Order can create it
    internal static Result<Feedback> Create(OrderId orderId, int rating, string comment)
    {
        if (string.IsNullOrWhiteSpace(comment))
            return OrderErrors.FeedbackCommentEmpty;

       var ratingResult = Rating.Create(rating); 
         if (ratingResult.IsFailure)
              return ratingResult.TopError;

        return Result.Success(new Feedback(orderId, ratingResult.Value, comment));
    }

    // --- Operations ---
    // Marked internal so only the Order can trigger a reply
    internal Result AddReply(string replyText)
    {
        if (string.IsNullOrWhiteSpace(replyText)) return FeedbackErrors.EmptyReply;

        if (Reply is not null) return FeedbackErrors.AlreadyReplied;

        Reply = replyText;
        RepliedAtUtc = DateTime.UtcNow;

        return Result.Success();
    }
}