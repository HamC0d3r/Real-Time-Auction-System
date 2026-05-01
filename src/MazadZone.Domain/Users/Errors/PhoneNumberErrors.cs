using AuthService.Domain.Constants;

namespace MazadZone.Domain.Users.Errors;

public static class PhoneNumberErrorCodes
{
    public const string Empty = "PhoneNumber.Empty";
    public const string InvalidLength = "PhoneNumber.InvalidLength"; 
    public const string InvalidFormat = "PhoneNumber.InvalidFormat";
}
public static class PhoneNumberErrors
{
    public static readonly Error Empty = Error.Validation(
        PhoneNumberErrorCodes.Empty, 
        "The phone number cannot be empty or whitespace.");

    
    // The new unified length validation error
    public static readonly Error InvalidLength = Error.Validation(
        PhoneNumberErrorCodes.InvalidLength, 
        $"The phone number must be exactly {UserConstants.PhoneNumberLength} digits long.");

    public static readonly Error InvalidFormat = Error.Validation(
        PhoneNumberErrorCodes.InvalidFormat, 
        "The phone number contains invalid characters. Only numeric digits are allowed.");
}