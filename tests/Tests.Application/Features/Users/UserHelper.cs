using MazadZone.Domain.Orders;
using MazadZone.Domain.Shared.ValueObjects;
using MazadZone.Domain.Users;
using MazadZone.Domain.Users.Events;
using MazadZone.Domain.Users.ValueObjects;

public static class UserHelper
{
    public static UserSuspendedDomainEvent CreateSuspensionEvent(UserId userId, DateTime? suspendUntil)
    {
        return new UserSuspendedDomainEvent(
            userId,
            "Violation",
            "test@test.com",
            suspendUntil
        );
    }

    public static User CreateActiveUser()
    {
        return User.Create(
            "test@mazadzone.com",
            "$2a$12$R9h/lSBaCR9xlBq6Z.a6COEa2vJw6.E8F/.C3PZpH7tH7D6bZc3Ky",
            "0791234567",
            "Omar", "Ahmad", "Ali", "Al-Saeed",
            new HashSet<UserRole>()).Value;
    }

    public static User CreateBannedUser()
    {
        var user = CreateActiveUser();
        var reason = Reason.Create("Testing Banned").Value;
        user.Ban(reason);
        return user;
    }

    public static User CreateSuspendedUser(DateTime? suspendUntil = null)
    {
        var user = CreateActiveUser();
        var reason = Reason.Create("Testing suspension").Value;
        user.Suspend(reason, suspendUntil ?? DateTime.UtcNow.AddDays(7));
        return user;
    }
}