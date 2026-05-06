using AuthService.Domain.Constants;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Primitives.Results;
using MazadZone.Domain.Users.ValueObjects;

namespace MazadZone.Infrastructure.Authentication; 

public class RefreshToken : Entity<RefreshTokenId>
{
    private RefreshToken() { }

    private RefreshToken(RefreshTokenId id, string token, UserId userId, DateTime expiresAt) 
    {
        Token = token;
        UserId = userId;
        ExpiresAt = expiresAt;
        CreatedAt = DateTime.UtcNow;
        IsRevoked = false;
    }

    public string Token { get; private set; } 
    public DateTime ExpiresAt { get; private set; }
    public bool IsRevoked { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? RevokedAt { get; private set; }
    public UserId UserId { get; private set; }

    public bool IsActive => !IsRevoked && DateTime.UtcNow < ExpiresAt;

    public static Result<RefreshToken> Create(string token, UserId userId)
    {
        return new RefreshToken(
            RefreshTokenId.New(),
            token,
            userId,
            DateTime.UtcNow.AddDays(UserConstants.RefreshTokenExpiresInDays));
    }

    public void Revoke()
    {
        if (IsRevoked) return; 

        IsRevoked = true;
        RevokedAt = DateTime.UtcNow;
    }
    
}
