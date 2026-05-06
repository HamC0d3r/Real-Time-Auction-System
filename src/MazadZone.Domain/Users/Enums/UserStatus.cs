namespace MazadZone.Domain.Users;

public enum UserStatus
{
    Active = 1,
PendingVerification =2,
    Suspended = 3, // Temporary soft-delete/deactivation
    Banned = 4     // Permanent deactivation ("Pan")
}