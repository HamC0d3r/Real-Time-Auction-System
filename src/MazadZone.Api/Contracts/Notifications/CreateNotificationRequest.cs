using MazadZone.Domain.Users.ValueObjects;

namespace MazadZone.Api.Contracts.Notifications;

public record CreateNotificationRequest(
    UserId UserId,
    string Title,
    string Message);