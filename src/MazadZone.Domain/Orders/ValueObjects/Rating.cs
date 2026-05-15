namespace MazadZone.Domain.Orders;

public sealed record Rating
{
    public int Value { get; }

    public static Result<Rating> Create(int value)
    {
        if (value < OrderConstants.MinRating || value > OrderConstants.MaxRating)
            return OrderErrors.FeedbackInvalidRating;

        return new Rating(value);
    }

    private Rating(int value)
    {
        Value = value;
    }
}