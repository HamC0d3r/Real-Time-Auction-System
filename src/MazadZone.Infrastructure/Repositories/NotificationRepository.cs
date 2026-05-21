using MazadZone.Domain.Notifications;
using MazadZone.Domain.Repositories;
using MazadZone.Domain.Users.ValueObjects;
using MazadZone.Infrastructure.Persistence;

namespace MazadZone.Infrastructure.Repositories;
public class NotificationRepository : GenericRepository<Notification>, INotificationRepository
{
    private readonly AppDbContext _context;
    public NotificationRepository(AppDbContext context) : base(context)
    {
        _context = context;
    }

    public Task AddAsync(Notification notification, CancellationToken ct = default)
    {
        throw new NotImplementedException();
    }

    public Task<Notification?> GetByIdAsync(NotificationId id, CancellationToken ct = default)
    {
        throw new NotImplementedException();
    }

    public Task<IEnumerable<Notification>> GetByUserIdAsync(UserId userId, CancellationToken ct = default)
    {
        throw new NotImplementedException();
    }

    public Task<int> GetUnreadCountAsync(UserId userId, CancellationToken ct = default)
    {
        throw new NotImplementedException();
    }

    public Task NotifyAdminAsync(string title, string message, CancellationToken ct = default)
    {
        throw new NotImplementedException();
    }

    public Task NotifyBidderAsync(Guid bidderId, string title, string message, CancellationToken ct = default)
    {
        throw new NotImplementedException();
    }

    public Task NotifySellerAsync(Guid sellerId, string title, string message, CancellationToken ct = default)
    {
        throw new NotImplementedException();
    }

    public Task NotifyUserAsync(UserId userId, string title, string message, CancellationToken ct)
    {
        throw new NotImplementedException();
    }
}