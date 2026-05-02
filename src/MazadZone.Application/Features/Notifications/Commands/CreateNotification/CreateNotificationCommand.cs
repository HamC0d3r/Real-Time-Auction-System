using MazadZone.Domain.Notifications;
using MazadZone.Domain.Users.ValueObjects;

namespace MazadZone.Application.Features.Notifications.Commands.CreateNotification;

public record CreateNotificationCommand(
    UserId UserId,
    string Title,
    string Message) : ICommand<NotificationId>;