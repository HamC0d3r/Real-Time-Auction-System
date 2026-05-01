namespace AuthService.Domain.Constants;

public static class UserConstants
{
    public const int NameMaxLength = 50;
    public const int EmailMaxLength = 100;
    public const int PasswordMinLength = 6;
    public const int PasswordMaxLenght = 100;
    public const int PhoneNumberLength = 9;
    public const int UserNameMinLength = 3;
    public const int UserNameMaxLength = 20;
    public const string UserNameAllowedCharactersRegex = @"^[a-zA-Z0-9_]+$";

}