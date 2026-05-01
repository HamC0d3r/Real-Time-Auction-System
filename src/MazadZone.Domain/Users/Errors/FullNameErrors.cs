using AuthService.Domain.Constants;

namespace MazadZone.Domain.Users.Errors; 

public static class FullNameErrorCodes
{
    // Empty Codes
    public const string FirstNameEmpty = "FullName.FirstNameEmpty";
    public const string SecondNameEmpty = "FullName.SecondNameEmpty";
    public const string ThirdNameEmpty = "FullName.ThirdNameEmpty";
    public const string LastNameEmpty = "FullName.LastNameEmpty";

    // Length Codes
    public const string FirstNameTooLong = "FullName.FirstNameTooLong";
    public const string SecondNameTooLong = "FullName.SecondNameTooLong";
    public const string ThirdNameTooLong = "FullName.ThirdNameTooLong";
    public const string LastNameTooLong = "FullName.LastNameTooLong";
}

public static class FullNameErrors
{
    // Empty Validations
    public static readonly Error FirstNameEmpty = Error.Validation(
        FullNameErrorCodes.FirstNameEmpty, 
        "First name is required.");
        
    public static readonly Error SecondNameEmpty = Error.Validation(
        FullNameErrorCodes.SecondNameEmpty, 
        "Second name is required.");
        
    public static readonly Error ThirdNameEmpty = Error.Validation(
        FullNameErrorCodes.ThirdNameEmpty, 
        "Third name is required.");
        
    public static readonly Error LastNameEmpty = Error.Validation(
        FullNameErrorCodes.LastNameEmpty, 
        "Last name is required.");
    
    // Length Validations
    public static readonly Error FirstNameTooLong = Error.Validation(
        FullNameErrorCodes.FirstNameTooLong, 
        $"First name cannot exceed {UserConstants.NameMaxLength} characters.");
        
    public static readonly Error SecondNameTooLong = Error.Validation(
        FullNameErrorCodes.SecondNameTooLong, 
        $"Second name cannot exceed {UserConstants.NameMaxLength} characters.");
        
    public static readonly Error ThirdNameTooLong = Error.Validation(
        FullNameErrorCodes.ThirdNameTooLong, 
        $"Third name cannot exceed {UserConstants.NameMaxLength} characters.");
        
    public static readonly Error LastNameTooLong = Error.Validation(
        FullNameErrorCodes.LastNameTooLong, 
        $"Last name cannot exceed {UserConstants.NameMaxLength} characters.");
}