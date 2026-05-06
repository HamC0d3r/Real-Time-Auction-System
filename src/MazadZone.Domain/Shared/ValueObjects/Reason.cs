using MazadZone.Domain.Shared;
using MazadZone.Domain.Shared.Errors;

namespace MazadZone.Domain.Orders;

// A simple Value Object for the Reason to ensure type safety
public sealed record Reason
{
    public string Text { get; }

    public static Result<Reason> Create(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return ReasonErrors.Empty;

        if (text.Length > SharedConstainst.MaxReasonLength) return ReasonErrors.TooLong;

        if (text.Length < SharedConstainst.MinReasonLength) return ReasonErrors.TooShort;

        return new Reason(text);
    }

    private Reason(string text) => Text = text;
}