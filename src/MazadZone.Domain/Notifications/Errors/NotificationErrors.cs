using MazadZone.Domain.Primitives.Results;

namespace MazadZone.Domain.Notifications;

public static class NotificationErrorsCodes
{
    public const string NotFound = "Notification.NotFound";
    public const string AlreadyRead = "Notification.AlreadyRead";
    public const string AlreadyDeleted = "Notification.AlreadyDeleted";

    public const string AlreadyIsNotDeleted = "Notification.AlreadyIsNotDeleted";
}


public static class NotificationErrors
{
    public static readonly Error NotFound = Error.NotFound(
        NotificationErrorsCodes.NotFound,
        "The notification with the specified identifier was not found.");

    public static readonly Error AlreadyRead = Error.Conflict(
        NotificationErrorsCodes.AlreadyRead,
        "The notification is already marked as read.");

    public static readonly Error AlreadyDeleted = Error.Conflict(
        NotificationErrorsCodes.AlreadyDeleted,
        "The notification is already deleted.");

    public static readonly Error AlreadyIsNotDeleted = Error.Conflict(
        NotificationErrorsCodes.AlreadyIsNotDeleted,
        "The notification is not deleted.");
}