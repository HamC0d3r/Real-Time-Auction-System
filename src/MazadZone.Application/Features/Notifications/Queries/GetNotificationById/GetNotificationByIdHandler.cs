using Microsoft.Extensions.Logging;
using MazadZone.Application.Features.Notifications.Queries.DTOs;
using MazadZone.Application.Services;
using MazadZone.Domain.Notifications;

namespace MazadZone.Application.Features.Notifications.Queries.GetNotificationById;

public class GetNotificationByIdHandler : IQueryHandler<GetNotificationByIdQuery, NotificationDto>
{
    private readonly INotificationQueries _notificationQueries;
    private readonly ILogger<GetNotificationByIdHandler> _logger;

    public GetNotificationByIdHandler(
        INotificationQueries notificationQueries,
        ILogger<GetNotificationByIdHandler> logger)
    {
        _notificationQueries = notificationQueries;
        _logger = logger;
    }

    public async Task<Result<NotificationDto>> Handle(GetNotificationByIdQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Fetching notification {NotificationId}", request.NotificationId);

        var notification = await _notificationQueries.GetNotificationByIdAsync(request.NotificationId, cancellationToken);

        if (notification is null)
        {
            _logger.LogWarning("Notification {NotificationId} not found", request.NotificationId);
            return NotificationErrors.NotFound;
        }

        return notification;
    }
}