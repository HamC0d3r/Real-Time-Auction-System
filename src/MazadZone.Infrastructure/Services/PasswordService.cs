using MazadZone.Application.Services;

namespace MazadZone.Infrastructure.Services;
public class PasswordService : IPasswordService
{
    public bool ValidatePassword(string currentPassword, string storedHash)
    {
        return BCrypt.Net.BCrypt.Verify(currentPassword, storedHash);
    }

    public string HashPassword(string newPassword)
    {
        return BCrypt.Net.BCrypt.HashPassword(newPassword);
    }
}
