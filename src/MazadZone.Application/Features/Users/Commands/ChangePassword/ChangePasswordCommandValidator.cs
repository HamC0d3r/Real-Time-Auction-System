using MazadZone.Application.Common.Validation;
using MazadZone.Application.Features.Users.Commands.ChangePassword;
using MazadZone.Domain.Users.Errors;

namespace AuthService.Application.Features.Users.Commands.ChangePassword;

public class ChangePasswordCommandValidator : AbstractValidator<ChangePasswordCommand>
{
    public ChangePasswordCommandValidator()
    {
        RuleFor(x => x.UserId).MustBeValidUserId();

        RuleFor(x => x.CurrentPassword).NotEmpty();

        RuleFor(x => x.NewPassword).MustBeValidPassword();

        RuleFor(x => x.ConfirmNewPassword)
            .NotEmpty()
            .WithErrorCode(UserErrorCodes.ConfirmPasswordRequired)
            .Equal(x => x.NewPassword)
            .WithErrorCode(UserErrorCodes.PasswordsDoNotMatch)
            .WithMessage("The new password and confirmation password do not match.");
    }
}