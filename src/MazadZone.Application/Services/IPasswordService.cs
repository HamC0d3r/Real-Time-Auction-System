using MazadZone.Domain.Shared.Interfaces;

namespace MazadZone.Application.Services;

/// <summary>
/// Provides methods for validating and hashing user passwords.
/// </summary>
public interface IPasswordService : IScopedService
{
    /// <summary>
    /// Validates whether the provided current password matches the stored password hash.
    /// </summary>
    /// <param name="currentPassword">The plain-text password entered by the user.</param>
    /// <param name="storedHash">The hashed password stored in the database.</param>
    bool ValidatePassword(string currentPassword, string storedHash);

    /// <summary>
    /// Generates a secure hash for the specified plain-text password.
    /// </summary>
    /// <param name="newPassword">The plain-text password to hash.</param>
    /// <returns>A hashed string representation of the password.</returns>
    string HashPassword(string newPassword);
}

