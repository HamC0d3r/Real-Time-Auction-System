using MazadZone.Application.Common.Validation;

namespace MazadZone.Application.Features.Users.Commands.Ban;

public class BanUserCommandValidator : AbstractValidator<BanUserCommand>
{
    public BanUserCommandValidator()
    {
        RuleFor(x => x.UserId).MustBeValidUserId();

        RuleFor(x => x.Reason).MustBeValidReason();

    }
}