using MazadZone.Domain.Primitives;
using MazadZone.Domain.Users.ValueObjects;

namespace MazadZone.Domain.Notifications;

public class Notification : AggregateRoot<NotificationId>, IAuditableEntity, ISoftDeletable
{
    public string Title { get; private set; }
    public string Message { get; private set; }
    public UserId UserId { get; private set; }
    public DateTime CreatedOnUtc { get; set; }
    public bool IsRead { get; private set; }
    public DateTime? ModifiedOnUtc { get; set; }
    public bool IsDeleted { get; private set; }
    public DateTime? DeletedOnUtc { get; private set; }

    private Notification(NotificationId id, UserId userId, string title, string message)
    {
        Title = title;
        Message = message;
        CreatedOnUtc = DateTime.UtcNow;
        IsRead = false;
        UserId = userId;
        IsDeleted = false;
    }
    public void MarkAsRead()
    {
        if (!IsRead)
        {
            IsRead = true;
            ModifiedOnUtc = DateTime.UtcNow;
        }
    }

    // Factory Method

    public static Notification Create(UserId userId, string title, string message)
    {
        var notification = new Notification(new NotificationId(Guid.NewGuid()), userId, title, message);
        return notification;
    }

    Result ISoftDeletable.Delete()
    {
        if (!IsDeleted)
        {
            IsDeleted = true;
            DeletedOnUtc = DateTime.UtcNow;
            return Result.Success();
        }
        return Result.Failure(NotificationErrors.AlreadyDeleted);
        
    }

    public Result Restore()
    {
        if (IsDeleted)
        {
            IsDeleted = false;
            DeletedOnUtc = null;
            return Result.Success();
        }
        return Result.Failure(NotificationErrors.AlreadyIsNotDeleted);
    }
}