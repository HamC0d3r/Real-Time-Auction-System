namespace MazadZone.Domain.Orders;

public sealed record Rating
{
    public int Value { get; }

    public static Result<Rating> Create(int value)
    {
        if (value < 1 || value > 5)
            return OrderErrors.FeedbackInvalidRating;

        return new Rating(value);
    }

    private Rating(int value)
    {
        Value = value;
    }
}