using MazadZone.Domain.Auctions;
using MazadZone.Domain.Users;
using MazadZone.Domain.Users.Errors;
using MazadZone.Domain.Users.Events;
using MazadZone.Domain.ValueObjects;

namespace AuthService.Domain.Users;

public class User : AggregateRoot<UserId>, IAuditableEntity
{
    private User() { }

    private User(
        UserId id,
        Email email,
        PasswordHash passwordHash,
        UserName userName,
        PhoneNumber phoneNumber,
        FullName fullName,
        HashSet<UserRole> roles
        ) : base(id)
    {
        Email = email;
        PasswordHash = passwordHash;
        Roles = roles;
    }

    public FullName FullName { get; private set; }
    public UserName UserName { get; private set; }
    public PhoneNumber PhoneNumber { get; private set; }
    public Email Email { get; private set; }
    public PasswordHash PasswordHash { get; private set; }
    public UserStatus Status { get; private set; } = UserStatus.Active; // Default status
    public HashSet<UserRole> Roles { get; private set; }


    public DateTime CreatedOnUtc { get ; set ; }
    public DateTime? ModifiedOnUtc { get ; set ; }

    public static Result<User> Create(
        string email,
        string passwordHash,
        string userName,
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

        var userNameResult = UserName.Create(userName);
        if (userNameResult.IsFailure) return userNameResult.TopError;

        var phoneNumberResult = PhoneNumber.Create(phoneNumber);
        if (phoneNumberResult.IsFailure) return phoneNumberResult.TopError;

        var fullNameResult = FullName.Create(firstName, secondName, thirdName, lastName);
        if (fullNameResult.IsFailure) return fullNameResult.TopError;

        var user = new User(
            UserId.New(),
            emailResult.Value,
            passwordHashResult.Value,
            userNameResult.Value,
            phoneNumberResult.Value,
            fullNameResult.Value,
            roles
        );

        return Result.Success(user);
    }

    public Result ChangeEmail(string newEmail)
    {
        var emailResult = Email.Create(newEmail);   
        if (emailResult.IsFailure) return emailResult.TopError;

        Email = emailResult.Value;
        return Result.Success();
    }

    public Result ChangePassword(string newPasswordHash)
    {
        var passwordHashResult = PasswordHash.Create(newPasswordHash);
        if (passwordHashResult.IsFailure) return passwordHashResult.TopError;

        PasswordHash = passwordHashResult.Value;
        return Result.Success();
    }

    /// <summary>
    /// Temporarily deactivates the user. They can be restored later.
    /// </summary>
    public Result Suspend()
    {
        // Guard clauses to protect the state machine invariants
        if (Status == UserStatus.Banned) return UserErrors.CannotSuspendBannedUser;

        if (Status == UserStatus.Suspended) return UserErrors.AlreadySuspended;

        Status = UserStatus.Suspended;
        
        RaiseDomainEvent(new UserSuspendedDomainEvent(this.Id));

        return Result.Success();
    }

    /// <summary>
    /// Permanently deactivates the user. This is irreversible.
    /// </summary>
    public Result Ban()
    {
        if (Status == UserStatus.Banned) return Result.Success();

        Status = UserStatus.Banned;

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

}
