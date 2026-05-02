using FluentValidation;
using MazadZone.Application.Features.Notifications.Commands.DeleteNotification;

namespace MazadZone.Application.Features.Notifications.Commands.DeleteNotification;

public class DeleteNotificationValidator : AbstractValidator<DeleteNotificationCommand>
{
    public DeleteNotificationValidator()
    {
        RuleFor(x => x.NotificationId).NotEmpty();
    }
}