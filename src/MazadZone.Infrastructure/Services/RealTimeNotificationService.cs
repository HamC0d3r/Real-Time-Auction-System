using MazadZone.Application.Services;
using MazadZone.Domain.Notifications;

namespace MazadZone.Infrastructure.Services;

public class RealTimeNotificationService : IRealTimeNotificationService
{
    public Task SendNotificationAsync(Guid userId, NotificationId notificationId, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }
}