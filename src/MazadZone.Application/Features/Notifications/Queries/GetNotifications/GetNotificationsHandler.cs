using Microsoft.Extensions.Logging;
using MazadZone.Application.Features.Notifications.Queries.DTOs;
using MazadZone.Application.Services;

namespace MazadZone.Application.Features.Notifications.Queries.GetNotifications;

public class GetNotificationsQueryHandler : IQueryHandler<GetNotificationsQuery, NotificationsListDto>
{
    private readonly INotificationQueries _notificationQueries;
    private readonly ILogger<GetNotificationsQueryHandler> _logger;

    public GetNotificationsQueryHandler(
        INotificationQueries notificationQueries,
        ILogger<GetNotificationsQueryHandler> logger)
    {
        _notificationQueries = notificationQueries;
        _logger = logger;
    }

    public async Task<Result<NotificationsListDto>> Handle(GetNotificationsQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Fetching notifications for user {UserId}, page {PageNumber}, size {PageSize}",
            request.UserId, request.PageNumber, request.PageSize);

        var notifications = await _notificationQueries.GetNotificationsAsync(
            request.UserId, request.PageNumber, request.PageSize, cancellationToken);

        var result = new NotificationsListDto(notifications);

        _logger.LogInformation("Fetched {Count} notifications for user {UserId}",
            notifications.Items.Count, request.UserId);

        return result;
    }
}