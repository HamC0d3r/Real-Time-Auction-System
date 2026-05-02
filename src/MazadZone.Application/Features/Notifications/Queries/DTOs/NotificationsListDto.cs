using MazadZone.Application.Common.Paging;

namespace MazadZone.Application.Features.Notifications.Queries.DTOs;

public record NotificationsListDto(
    PagedList<NotificationDto> Notifications);