using MazadZone.Domain.Notifications;
using MazadZone.Domain.Users.ValueObjects;

namespace MazadZone.Domain.Repositories;

public interface INotificationRepository
{
    Task<Notification?> GetByIdAsync(NotificationId id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Notification>> GetByUserIdAsync(UserId userId, CancellationToken cancellationToken = default);
    Task<int> GetUnreadCountAsync(UserId userId, CancellationToken cancellationToken = default);
    Task AddAsync(Notification notification, CancellationToken cancellationToken = default);
    void Update(Notification notification);
    void Delete(Notification notification);
}