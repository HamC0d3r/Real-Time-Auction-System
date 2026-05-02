using MazadZone.Domain.Notifications;

namespace MazadZone.Application.Features.Notifications.Commands.DeleteNotification;

public record DeleteNotificationCommand(NotificationId NotificationId) : ICommand<Unit>;