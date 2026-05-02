using MazadZone.Domain.Users.ValueObjects;

namespace MazadZone.Api.Contracts.Notifications;

public record GetNotificationsRequest(
    UserId UserId,
    int PageNumber = 1,
    int PageSize = 10);