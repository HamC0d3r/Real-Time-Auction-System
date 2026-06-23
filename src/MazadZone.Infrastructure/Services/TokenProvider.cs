using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using MazadZone.Application.Services;
using MazadZone.Domain.Users;
using MazadZone.Infrastructure.Persistence;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;


namespace MazadZone.Infrastructure.Services;

public class TokenProvider(IConfiguration configuration, AppDbContext context) : ITokenProvider
{
    public  string GenerateAccessToken(User user)
    {
        // Retrieve the active signing key 
        // from the SigningKeys table
        var signingKey = context.SigningKeys.FirstOrDefault(k => k.IsActive);

        // If no active signing key is found, throw an exception
        if (signingKey == null)
        {
            throw new Exception("No active signing key available.");
        }

        // Convert the Base64-encoded private key string back to a byte array
        var privateKeyBytes = Convert.FromBase64String(signingKey.PrivateKey);

        // Create a new RSA instance for cryptographic operations
        var rsa = RSA.Create();

        // Import the RSA private key into the RSA instance
        rsa.ImportRSAPrivateKey(privateKeyBytes, out _);

        // Create a new RsaSecurityKey using the RSA instance
        var rsaSecurityKey = new RsaSecurityKey(rsa)
        {
            // Assign the Key ID to link the JWT with the correct public key
            KeyId = signingKey.KeyId
        };

        // Define the signing credentials using the RSA security key and specifying the algorithm
        var creds = new SigningCredentials(rsaSecurityKey, SecurityAlgorithms.RsaSha256);


        // Initialize a list of claims to include in the JWT
        var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
            };

        
        // Iterate through all possible enum values and check if the user has that flag
foreach (UserRole role in Enum.GetValues<UserRole>())
{
    // Skip 'None' and verify if the user's Roles contains this specific flag
    if (role != UserRole.None && user.Roles.HasFlag(role))
    {
        claims.Add(new Claim(ClaimTypes.Role, role.ToString()));
    }
}

        // Define the JWT token's properties
        var tokenDescriptor = new JwtSecurityToken(
        issuer: configuration["Jwt:Issuer"], 
        audience: configuration["Jwt:Audience"], 
        claims: claims, 
        expires: DateTime.UtcNow.AddHours(1), 
        signingCredentials: creds // The credentials used to sign the token
        );

        // Create a JWT token handler to serialize the token
        var tokenHandler = new JwtSecurityTokenHandler();

        // Serialize the token to a string
        var token = tokenHandler.WriteToken(tokenDescriptor);
        // Return the serialized JWT token
        return token;
    }

    public string GenerateRefreshToken()
    {
        //A secure random string is generated using RandomNumberGenerator
        var randomNumber = new byte[64];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }
    }
    public string HashToken(string token)
    {
        // This takes the actual token, scrambles it mathematically, and returns a consistent hash
        using var sha256 = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(token);
        var hash = sha256.ComputeHash(bytes);

        return Convert.ToBase64String(hash);
    }

    }
