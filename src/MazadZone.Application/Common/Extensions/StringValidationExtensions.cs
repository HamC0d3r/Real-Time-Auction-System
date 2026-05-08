using AuthService.Domain.Constants;
using MazadZone.Domain.Shared;

public static class StringValidationExtensions
{
    public static IRuleBuilderOptions<T, string> MustBeValidReason<T>(this IRuleBuilder<T, string> ruleBuilder)
    {
        return ruleBuilder
            .NotEmpty()
            .WithMessage("Reason is required and cannot be empty.")
            .MinimumLength(SharedConstainst.MinReasonLength)
            .WithMessage($"Reason must be at least {SharedConstainst.MinReasonLength} characters long.")
            .MaximumLength(SharedConstainst.MaxReasonLength)
            .WithMessage($"Reason cannot exceed {SharedConstainst.MaxReasonLength} characters.");

    }

    public static IRuleBuilderOptions<T, string> MustBeValidEmail<T>(this IRuleBuilder<T, string> ruleBuilder)
    {
        return ruleBuilder
            .NotEmpty()
            .WithMessage("Email address is required.")
            .EmailAddress() // FluentValidation's built-in email checker
            .WithMessage("A valid email address is required.")
            .MaximumLength(UserConstants.EmailMaxLength) // Standard maximum length for an email column in most databases
            .WithMessage("Email address cannot exceed 255 characters.");
    }

public static IRuleBuilderOptions<T, string> MustBeValidPassword<T>(this IRuleBuilder<T, string> ruleBuilder)
    {
        return ruleBuilder
            .NotEmpty()
            .WithMessage("Password is required.")
            .MinimumLength(UserConstants.PasswordMinLength)
            .WithMessage("Password must be at least 8 characters long.")
            .MaximumLength(UserConstants.PasswordMaxLenght) // Prevents extremely long inputs that can slow down your hashing algorithm
            .WithMessage("Password cannot exceed 50 characters.")
            .Matches("[A-Z]")
            .WithMessage("Password must contain at least one uppercase letter.")
            .Matches("[a-z]")
            .WithMessage("Password must contain at least one lowercase letter.")
            .Matches("[0-9]")
            .WithMessage("Password must contain at least one number.")
            .Matches("[^a-zA-Z0-9]")
            .WithMessage("Password must contain at least one special character.");
    }
}