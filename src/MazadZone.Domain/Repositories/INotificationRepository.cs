using MazadZone.Domain.Notifications;

namespace MazadZone.Domain.Repositories;

public interface INotificationRepository
{
    Task AddAsync(Notification notification, CancellationToken cancellationToken = default);
    
}