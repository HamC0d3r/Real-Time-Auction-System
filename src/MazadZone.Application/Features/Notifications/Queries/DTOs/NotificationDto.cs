using MazadZone.Domain.Notifications;
using MazadZone.Domain.Users.ValueObjects;

namespace MazadZone.Application.Features.Notifications.Queries.DTOs;

public record NotificationDto(
    NotificationId Id,
    string Title,
    string Message,
    UserId UserId,
    DateTime CreatedOnUtc,
    bool IsRead,
    DateTime? ModifiedOnUtc);