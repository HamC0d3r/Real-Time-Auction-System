using System.Reflection.Metadata.Ecma335;
using MazadZone.Domain.Shared.ValueObjects;
using MazadZone.Domain.Users.Errors;
using MazadZone.Domain.Users.Events;
using MazadZone.Domain.Users.ValueObjects;
using MazadZone.Domain.ValueObjects;

namespace MazadZone.Domain.Users;

public class User : AggregateRoot<UserId>, IAuditableEntity
{
    public IReadOnlyCollection<HashedRefreshToken> HashedRefreshTokens => _hashedRefreshTokens.AsReadOnly();

    private User() { }

    private User(
        UserId id,
        Email email,
        PasswordHash passwordHash,
        PhoneNumber phoneNumber,
        FullName fullName,
        HashSet<UserRole> roles
        ) : base(id)
    {
        Email = email;
        PasswordHash = passwordHash;
        Roles = roles;
        PhoneNumber = phoneNumber;
        FullName = fullName;
    }

    public FullName FullName { get; private set; }
    public PhoneNumber PhoneNumber { get; private set; }
    public Email Email { get; private set; }
    public PasswordHash PasswordHash { get; private set; }
    public UserStatus Status { get; private set; } = UserStatus.Active; // Default status
    public HashSet<UserRole> Roles { get; private set; }
    public Reason? EnforcementReason { get; private set; } = null;
    public DateTime? SuspensionUntil { get; private set; } = null;

    public DateTime CreatedOnUtc { get; set; }
    public DateTime? ModifiedOnUtc { get; set; }

    private readonly List<HashedRefreshToken> _hashedRefreshTokens = new();

    public bool IsSeller => Roles.Contains(UserRole.Seller);
    public bool IsBidder => Roles.Contains(UserRole.Bidder);
    

    public static Result<User> Create(
        string email,
        string passwordHash,
        string phoneNumber,
        string firstName,
        string secondName,
        string thirdName,
        string lastName,
        HashSet<UserRole> roles
    )
    {
        var emailResult = Email.Create(email);
        if (emailResult.IsFailure) return emailResult.TopError;

        var passwordHashResult = PasswordHash.Create(passwordHash);
        if (passwordHashResult.IsFailure) return passwordHashResult.TopError;


        var phoneNumberResult = PhoneNumber.Create(phoneNumber);
        if (phoneNumberResult.IsFailure) return phoneNumberResult.TopError;

        var fullNameResult = FullName.Create(firstName, secondName, thirdName, lastName);
        if (fullNameResult.IsFailure) return fullNameResult.TopError;

        var user = new User(
            UserId.New(),
            emailResult.Value,
            passwordHashResult.Value,
            phoneNumberResult.Value,
            fullNameResult.Value,
            roles
        );

        return Result.Success(user);
    }

    public void ChangeEmail(Email newEmail)
    {
        if (newEmail == Email) return;

        var oldEmail = Email; // Capture the old state
        Email = newEmail;

        RaiseDomainEvent(new UserEmailChangedDomainEvent(Id, oldEmail, newEmail));
    }

    public void ChangePassword(PasswordHash newPasswordHash)
    {
        PasswordHash = newPasswordHash;

        RaiseDomainEvent(new UserPasswordChangedDomainEvent(Id, Email));
    }

    /// <summary>
    /// Temporarily deactivates the user. They can be restored later.
    /// </summary>
    public Result Suspend(Reason reason,DateTime until)
    {
        // Guard clauses to protect the state machine invariants
        if (Status == UserStatus.Banned) return UserErrors.CannotSuspendBannedUser;

        if (Status == UserStatus.Suspended) return UserErrors.AlreadySuspended;

        Status = UserStatus.Suspended;
        EnforcementReason = reason;
        SuspensionUntil = until;

        RevokeAllRefreshTokens(); // Security rule enforced here!

        RaiseDomainEvent(new UserSuspendedDomainEvent(this.Id,Email.Value, EnforcementReason.Text, SuspensionUntil));

        return Result.Success();
    }

    /// <summary>
    /// Permanently deactivates the user. This is irreversible.
    /// </summary>
    public Result Ban(Reason reason)
    {
        if (Status == UserStatus.Banned) return Result.Success();

        Status = UserStatus.Banned;
         EnforcementReason = reason;

        RevokeAllRefreshTokens();

        RaiseDomainEvent(new UserBannedDomainEvent(this.Id, reason.Text, Email));

        return Result.Success();
    }

    /// <summary>
    /// Returns a Suspended user back to Active status. Blocks Banned users.
    /// </summary>
    public Result Activate()
    {

        if (Status == UserStatus.Active) return Result.Success();    

        if (Status == UserStatus.Banned) return UserErrors.CannotActivateBannedUser;


        Status = UserStatus.Active;
        SuspensionUntil = null;

        RaiseDomainEvent(new UserActivatedDomainEvent(this.Id, Email.Value));

        return Result.Success();
    }

    public Result AddRefreshToken(string hashedToken)
    {

        // Architect Rule: If user is Banned, they cannot get new tokens
        if (Status == UserStatus.Banned) return UserErrors.CannotAuthenticateBannedUser;

        if (Status == UserStatus.Suspended)
        {
            if (SuspensionUntil.HasValue && SuspensionUntil.Value > DateTime.UtcNow)
            {
                return UserErrors.UserIsSuspended;
            }

            var result = Activate();
            if(result.IsFailure) return result.TopError;
        }

        _hashedRefreshTokens.RemoveAll(r => r.IsExpired);

        var refreshTokenResult = HashedRefreshToken.Create(hashedToken, this.Id);

        if (refreshTokenResult.IsFailure)
            return refreshTokenResult.TopError;

        _hashedRefreshTokens.Add(refreshTokenResult.Value);

        return Result.Success();
    }

    // 3. Logic to revoke all tokens (useful for "Logout everywhere" or "Password Change")

    public void InvalidateSession(string hashedToken, bool invalidateAll)
    {
        if (invalidateAll)
        {
            RevokeAllRefreshTokens();
        }

        var token = _hashedRefreshTokens.FirstOrDefault(t => t.Token == hashedToken && !t.IsExpired);

        // If not found, we don't error; the goal of invalidation is already met.
        token?.Revoke();
    }

    private void RevokeAllRefreshTokens()
    {
        foreach (var token in _hashedRefreshTokens.Where(t => t.IsActive))
        {
            token.Revoke();
        }
    }

    public Result<HashedRefreshToken> RotateRefreshToken(string hashedOldToken, string hashedNewToken)
    {
        var existingToken = _hashedRefreshTokens.FirstOrDefault(t => t.Token == hashedOldToken);

        if (existingToken is null || !existingToken.IsActive)
            return UserErrors.InvalidToken;

        existingToken.Revoke();

        var newTokenResult = HashedRefreshToken.Create(hashedNewToken, this.Id);
        if (newTokenResult.IsFailure) return newTokenResult.TopError;

        _hashedRefreshTokens.Add(newTokenResult.Value);

        EnforceMaxActiveSessions();

        return newTokenResult.Value;
    }

    private void EnforceMaxActiveSessions()
    {
        // Get all tokens that are currently active
        var activeTokens = _hashedRefreshTokens
            .Where(t => t.IsActive)
            .OrderBy(t => t.CreatedAt) // Oldest first
            .ToList();

        // If we have more than the limit, revoke the oldest ones
        if (activeTokens.Count > UserPolicies.MaxActiveTokens)
        {
            int tokensToRevoke = activeTokens.Count - UserPolicies.MaxActiveTokens;

            for (int i = 0; i < tokensToRevoke; i++)
            {
                activeTokens[i].Revoke();
            }
        }

        // Optional Cleanup: Actually delete deeply expired tokens from the List to save DB space
        _hashedRefreshTokens.RemoveAll(t => t.IsExpired && t.ExpiresAt < DateTime.UtcNow.AddDays(-30));
    }

    public void AddRole(UserRole role)
    {
        if (Roles.Contains(role)) return;

        Roles.Add(role);
    }

    public void AddSellerRole()
    {
        if (Roles.Contains(UserRole.Seller)) return;

        Roles.Add(UserRole.Seller);
    }

    public void AddBidderRole()
    {
        if (Roles.Contains(UserRole.Bidder)) return;

        Roles.Add(UserRole.Bidder);
    }

    public void RemoveRole(UserRole role)
    {
        if (!Roles.Contains(role)) return;

        Roles.Remove(role);
    }


}
