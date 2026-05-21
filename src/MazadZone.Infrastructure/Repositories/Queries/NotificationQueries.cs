using MazadZone.Application.Common.Paging;
using MazadZone.Application.Features.Notifications.Queries.DTOs;
using MazadZone.Application.Services;
using MazadZone.Domain.Notifications;
using MazadZone.Domain.Users.ValueObjects;

namespace MazadZone.Infrastructure.Repositories.Queries;

public class NotificationQueries : INotificationQueries
{
    public Task<NotificationDto?> GetNotificationByIdAsync(NotificationId id, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task<PagedList<NotificationDto>> GetNotificationsAsync(UserId userId, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task<int> GetUnreadCountAsync(UserId userId, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }
}