using MazadZone.Domain.Notifications;
using MazadZone.Domain.Shared.Interfaces;

namespace MazadZone.Application.Services;

public interface IRealTimeNotificationService : IScopedService
{
    Task SendNotificationAsync(Guid userId, NotificationId notificationId, CancellationToken cancellationToken = default);
}
