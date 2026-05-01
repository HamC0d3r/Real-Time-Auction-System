namespace MazadZone.Domain.Users;

public enum UserStatus
{
    Active = 1,
    Suspended = 2, // Temporary soft-delete/deactivation
    Banned = 3     // Permanent deactivation ("Pan")
}