using MazadZone.Domain.Auctions;
using MazadZone.Domain.Users;

namespace MazadZone.Domain.Notifications;

public class Notification : IAuditableEntity
{
    public string Title { get; private set; }
    public string Message { get; private set; }
    public UserId UserId { get; private set; }
    public DateTime CreatedOnUtc { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }
    public DateTime? ModifiedOnUtc { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }
    public bool IsRead { get; private set; }

    private Notification(NotificationId id, string title, string message)
    {
        Title = title;
        Message = message;
        CreatedOnUtc = DateTime.UtcNow;
        IsRead = false;
    }
    public void MarkAsRead()
    {
        IsRead = true;
    }

    // Factory Method

    public static Notification Create(UserId userId, string title, string message)
    {
        var notification = new Notification(new NotificationId(Guid.NewGuid()), title, message);
        notification.UserId = userId;
        return notification;
    }

}