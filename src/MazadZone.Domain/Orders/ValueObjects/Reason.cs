namespace MazadZone.Domain.Orders;

// A simple Value Object for the Reason to ensure type safety
public sealed record Reason
{
    public string Text { get; }

    public static Result<Reason> Create(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return OrderErrors.DisputeReasonEmpty;

        return new Reason(text);
    }

    private Reason(string text) => Text = text;
}