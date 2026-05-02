using FluentValidation;
using MazadZone.Application.Features.Notifications.Commands.CreateNotification;
using MazadZone.Domain.Notifications;

namespace MazadZone.Application.Features.Notifications.Commands.CreateNotification;

public class CreateNotificationValidator : AbstractValidator<CreateNotificationCommand>
{
    public CreateNotificationValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(NotificationConstraints.TitleMaxLength);
        RuleFor(x => x.Message).NotEmpty().MaximumLength(NotificationConstraints.MessageMaxLength);
    }
}