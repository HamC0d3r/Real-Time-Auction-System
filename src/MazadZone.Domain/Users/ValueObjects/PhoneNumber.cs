using System.Linq;
using AuthService.Domain.Constants;
using MazadZone.Domain.Users.Errors;

namespace MazadZone.Domain.ValueObjects;

public record PhoneNumber
{

    #pragma warning disable CS8618 
    #pragma warning disable CS0519
    private PhoneNumber() { } 
    #pragma warning restore CS8618


    private PhoneNumber(string value)
        => Value = value;

    public string Value { get; init; }
    public static Result<PhoneNumber> Create(string number)
    {
        var cleanNumber = number?.Trim();

        if (string.IsNullOrWhiteSpace(cleanNumber)) return PhoneNumberErrors.Empty;

        if (cleanNumber.Length != UserConstants.PhoneNumberLength) return PhoneNumberErrors.InvalidLength;

        if (!cleanNumber.All(char.IsDigit)) return PhoneNumberErrors.InvalidFormat;

        return new PhoneNumber(cleanNumber);
    }
}