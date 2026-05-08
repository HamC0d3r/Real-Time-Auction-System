using MazadZone.Application.Common.Validation;

namespace MazadZone.Application.Features.Users.Commands.Activate;

public class ActivateUserCommandValidator : AbstractValidator<ActivateUserCommand>
{
    public ActivateUserCommandValidator()
    {
        RuleFor(x => x.UserId).MustBeValidUserId();
    }
}