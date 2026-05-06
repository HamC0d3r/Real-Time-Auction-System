using MazadZone.Domain.Auctions;
using MazadZone.Domain.Users.Errors;
using MazadZone.Domain.Users.Events;
using MazadZone.Domain.ValueObjects;
using MazadZone.Infrastructure.Authentication;

namespace MazadZone.Domain.Users;

public class User : AggregateRoot<UserId>, IAuditableEntity
{
    public IReadOnlyCollection<RefreshToken> RefreshTokens => _refreshTokens.AsReadOnly();

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
    public Reason? BanReason { get; private set; } = null;
    public DateTime? SuspensionUntil { get; private set; } = null;

    public DateTime CreatedOnUtc { get ; set ; }
    public DateTime? ModifiedOnUtc { get; set; }

    private readonly List<RefreshToken> _refreshTokens = new();

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

        Email = newEmail;
    }

    public void ChangePassword(PasswordHash newPasswordHash)
    {
        PasswordHash = newPasswordHash;
    }

    /// <summary>
    /// Temporarily deactivates the user. They can be restored later.
    /// </summary>
    public Result Suspend(DateTime until)
    {
        // Guard clauses to protect the state machine invariants
        if (Status == UserStatus.Banned) return UserErrors.CannotSuspendBannedUser;

        if (Status == UserStatus.Suspended) return UserErrors.AlreadySuspended;

        Status = UserStatus.Suspended;
        SuspensionUntil = until;

        RevokeAllRefreshTokens(); // Security rule enforced here!
        
        RaiseDomainEvent(new UserSuspendedDomainEvent(this.Id));

        return Result.Success();
    }

    /// <summary>
    /// Permanently deactivates the user. This is irreversible.
    /// </summary>
    public Result Ban(Reason reason)
    {
        if (Status == UserStatus.Banned) return Result.Success();

        Status = UserStatus.Banned;
        BanReason = reason;

        RevokeAllRefreshTokens();

        RaiseDomainEvent(new UserBannedDomainEvent(this.Id));

        return Result.Success();
    }

    /// <summary>
    /// Returns a Suspended user back to Active status. Blocks Banned users.
    /// </summary>
    public Result Activate()
    {
        if (Status == UserStatus.Banned) return UserErrors.CannotActivateBannedUser;

        if (Status == UserStatus.Active) return UserErrors.AlreadyActive;

        Status = UserStatus.Active;

        RaiseDomainEvent(new UserActivatedDomainEvent(this.Id));

        return Result.Success();
    }

    public Result AddRefreshToken(string token)
    {
        // Architect Rule: If user is Banned, they cannot get new tokens
        if (Status == UserStatus.Banned)
            return UserErrors.CannotAuthenticateBannedUser;

        if (Status == UserStatus.Suspended)
        {
            if (SuspensionUntil.HasValue && SuspensionUntil.Value > DateTime.UtcNow)
            {
                return UserErrors.UserIsSuspended;
            }

            Status = UserStatus.Active;
            SuspensionUntil = null;
        }

        var refreshTokenResult = RefreshToken.Create(token, this.Id);

        if (refreshTokenResult.IsFailure)
            return refreshTokenResult.TopError;

        _refreshTokens.Add(refreshTokenResult.Value);

        return Result.Success();
    }

    // 3. Logic to revoke all tokens (useful for "Logout everywhere" or "Password Change")

    public void InvalidateSession(string tokenValue, bool invalidateAll)
    {
        if (invalidateAll)
        {
            RevokeAllRefreshTokens();
        }

        var token = _refreshTokens.FirstOrDefault(t => t.Token == tokenValue && t.IsActive);

        // If not found, we don't error; the goal of invalidation is already met.
        token?.Revoke();
    }
    private void RevokeAllRefreshTokens()
    {
        foreach (var token in _refreshTokens.Where(t => t.IsActive))
        {
            token.Revoke();
        }
    }
 
}
