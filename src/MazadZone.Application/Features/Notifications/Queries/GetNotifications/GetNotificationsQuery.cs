using MazadZone.Application.Common.Paging;
using MazadZone.Application.Features.Notifications.Queries.DTOs;
using MazadZone.Domain.Users.ValueObjects;

namespace MazadZone.Application.Features.Notifications.Queries.GetNotifications;

public record GetNotificationsQuery(
    UserId UserId,
    int PageNumber = 1,
    int PageSize = 10) : IQuery<NotificationsListDto>;