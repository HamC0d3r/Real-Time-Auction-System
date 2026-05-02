using FluentValidation;
using MazadZone.Application.Features.Notifications.Commands.MarkAsRead;

namespace MazadZone.Application.Features.Notifications.Commands.MarkAsRead;

public class MarkAsReadValidator : AbstractValidator<MarkAsReadCommand>
{
    public MarkAsReadValidator()
    {
        RuleFor(x => x.NotificationId).NotEmpty();
    }
}