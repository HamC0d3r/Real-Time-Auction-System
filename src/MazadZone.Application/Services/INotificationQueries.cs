using MazadZone.Application.Common.Paging;
using MazadZone.Application.Features.Notifications.Queries.DTOs;
using MazadZone.Domain.Notifications;
using MazadZone.Domain.Users.ValueObjects;

namespace MazadZone.Application.Services;

public interface INotificationQueries
{
    Task<NotificationDto?> GetNotificationByIdAsync(NotificationId id, CancellationToken cancellationToken = default);
    Task<PagedList<NotificationDto>> GetNotificationsAsync(UserId userId, int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<int> GetUnreadCountAsync(UserId userId, CancellationToken cancellationToken = default);
}