using MazadZone.Application.Common.Validation;
using MazadZone.Application.Features.Users.Commands.ChangeEmail;

namespace AuthService.Application.Features.Users.Commands.ChangeEmail;

public class ChangeEmailCommandValidator : AbstractValidator<ChangeEmailCommand>
{
    public ChangeEmailCommandValidator()
    {
        RuleFor(x => x.UserId).MustBeValidUserId();
        RuleFor(x => x.NewEmail).MustBeValidEmail();
    }
}
