namespace MazadZone.Domain.Notifications;

public static class NotificationConstraints
{
    public const int TitleMaxLength = 100;
    public const int MessageMaxLength = 1000;

    public const int MaxNotificationsPerUser = 1000;

    public static readonly TimeSpan NotificationRetentionPeriodPerUser = TimeSpan.FromDays(30);
}