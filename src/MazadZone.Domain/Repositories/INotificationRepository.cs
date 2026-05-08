using MazadZone.Domain.Auctions;
using MazadZone.Domain.Notifications;
using MazadZone.Domain.Users.ValueObjects;

namespace MazadZone.Domain.Repositories;

public interface INotificationRepository : IGenericRepository<Notification>
{
    Task<Notification?> GetByIdAsync(NotificationId id, CancellationToken ct = default);
    Task<IEnumerable<Notification>> GetByUserIdAsync(UserId userId, CancellationToken ct = default);
    Task<int> GetUnreadCountAsync(UserId userId, CancellationToken ct = default);
    Task NotifyBidderAsync(Guid bidderId, string title, string message, CancellationToken ct = default);
    Task NotifySellerAsync(Guid bidderId, string title, string message, CancellationToken ct = default);
    Task NotifyUserAsync(UserId userId, string title, string message, CancellationToken ct);
    Task AddAsync(Notification notification, CancellationToken ct = default);
}