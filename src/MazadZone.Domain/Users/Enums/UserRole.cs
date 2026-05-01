namespace MazadZone.Domain.Users;



[Flags]
public enum UserRole
{
    None = 0,
    Bidder = 1,
    Seller = 2,
    Admin = 4
}
