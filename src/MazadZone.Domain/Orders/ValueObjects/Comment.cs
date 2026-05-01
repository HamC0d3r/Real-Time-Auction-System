namespace MazadZone.Domain.Orders;


public sealed record Comment
{

    // The 'init' property ensures immutability after creation
    public string Value { get; init; }

    // Private constructor forces usage of the static Create method
    private Comment(string value) => Value = value;

    public static Result<Comment> Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value)) return FeedbackErrors.Comment.Empty;

        if (value.Length > OrderConstants.MaxCommentLength) return FeedbackErrors.Comment.TooLong;

        return Result.Success(new Comment(value));
    }

    // Optional: Implicit conversion to string makes the domain logic much cleaner
    public static implicit operator string(Comment comment) => comment.Value;

    // Optional: Explicit conversion from string if you want to bypass validation (careful!)
    public override string ToString() => Value;
}