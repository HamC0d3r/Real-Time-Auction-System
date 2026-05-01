namespace MazadZone.Domain.Users;

using System.Text.RegularExpressions;
using AuthService.Domain.Constants;

public sealed record Email
{
    private static readonly Regex EmailRegex = new(
        @"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$", 
        RegexOptions.Compiled);

    public string Value { get; init; }

    private Email(string value) => Value = value;

    public static Result<Email> Create(string email)
    {
        if (string.IsNullOrWhiteSpace(email)) return EmailErrors.Empty;

        if (email.Length > UserConstants.EmailMaxLength) return EmailErrors.TooLong;

        if (!EmailRegex.IsMatch(email)) return EmailErrors.InvalidFormat;

        return Result.Success(new Email(email.ToLowerInvariant())); // Always normalize emails to lowercase!
    }

    public static implicit operator string(Email email) => email.Value;
    public override string ToString() => Value;
}