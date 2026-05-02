using MazadZone.Application.Features.Notifications.Queries.DTOs;
using MazadZone.Domain.Notifications;

namespace MazadZone.Application.Features.Notifications.Queries.GetNotificationById;

public record GetNotificationByIdQuery(NotificationId NotificationId) : IQuery<NotificationDto>;