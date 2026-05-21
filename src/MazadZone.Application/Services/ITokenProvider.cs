using MazadZone.Domain.Shared.Interfaces;
using MazadZone.Domain.Users;

namespace MazadZone.Application.Services;  

/// <summary>
/// Provides methods for generating JWT tokens and refresh tokens, 
/// as well as hashing refresh tokens for secure storage.
/// </summary>

public interface ITokenProvider : IScopedService
{
     /// <summary>
    /// Generates a JSON Web Token (JWT) for the specified user and client.
    /// </summary>
    /// <param name="user">The user for whom the token is being generated.</param>
    /// <param name="client">The client requesting the token, used for audience validation.</param>
    /// <returns>A signed JWT token as a string.</returns>
    /// <exception cref="Exception">Thrown if no active signing key is found.</exception>
    string GenerateAccessToken(User user);

     /// <summary>
    /// Generates a secure refresh token as a random base64 string.
    /// </summary>
    /// <returns>A securely generated refresh token string.</returns>
    string GenerateRefreshToken();


    /// <summary>
    /// Hashes a refresh token using SHA256 before storing it in the database.
    /// This helps prevent token theft from compromising security.
    /// </summary>
    /// <param name="token">The plain-text refresh token to hash.</param>
    /// <returns>The hashed refresh token as a base64-encoded string.</returns>
    string HashToken(string token);
}