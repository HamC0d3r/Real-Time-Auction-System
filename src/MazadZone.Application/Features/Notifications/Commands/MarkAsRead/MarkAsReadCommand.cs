using MazadZone.Domain.Notifications;

namespace MazadZone.Application.Features.Notifications.Commands.MarkAsRead;

public record MarkAsReadCommand(NotificationId NotificationId) : ICommand<Unit>;