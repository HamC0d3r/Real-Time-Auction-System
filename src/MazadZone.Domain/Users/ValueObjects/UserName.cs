using System.Text.RegularExpressions;
using AuthService.Domain.Constants;
using MazadZone.Domain.Users.Errors;

namespace MazadZone.Domain.Users;

public  partial record UserName
{
    [GeneratedRegex(UserConstants.UserNameAllowedCharactersRegex)]
    private static partial Regex FormatRegex();

    private UserName() { } // EF Core

    private UserName(string value)
    {
        Value = value;
    }

    // The single underlying string
    public string Value { get; init; }

    // Factory method to enforce the invariants
    public static Result<UserName> Create(string username)
    {
        var cleanUsername = username?.Trim();

        // 1. Validate Empty/Null (Implicit conversion triggers here)
        if (string.IsNullOrWhiteSpace(cleanUsername))return UserNameErrors.Empty;

        // 2. Validate Length independently for precise UX
        if (cleanUsername.Length < UserConstants.UserNameMinLength)
            return UserNameErrors.TooShort;

        if (cleanUsername.Length > UserConstants.UserNameMaxLength)
            return UserNameErrors.TooLong;

        if (!FormatRegex().IsMatch(cleanUsername)) return UserNameErrors.InvalidFormat;

        return new UserName(cleanUsername.ToLowerInvariant());
    }
}