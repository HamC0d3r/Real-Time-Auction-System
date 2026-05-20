using MazadZone.Domain.Orders;
using MazadZone.Domain.Primitives.Results;
using MazadZone.Domain.Shared.ValueObjects;
using MazadZone.Domain.Users;
using MazadZone.Domain.Users.Errors;
using MazadZone.Domain.Users.Events;
using MazadZone.Domain.Users.ValueObjects;
using Shouldly;

namespace Tests.Domain.Users;

public class UserTests
{
    private const string ValidEmail = "omar@mazadzone.com";
    private const string ValidHash = "$2a$12$R9h/lSBaCR9xlBq6Z.a6COEa2vJw6.E8F/.C3PZpH7tH7D6bZc3Ky";
    private const string ValidPhone = "0791234567"; // Adjust according to your UserConstants length
    private const string First = "Omar";
    private const string Second = "Ahmad";
    private const string Third = "Ali";
    private const string Last = "Al-Saeed";
    private const string TestingReason = "Testing Reason"; 

    #region 1. Factory Creation & Validation Pipeline

    [Fact]
    public void Create_Should_ReturnUser_When_AllInputsAreValid()
    {
        // Arrange
        var roles = new HashSet<UserRole> { UserRole.Bidder };

        // Act
        var result = User.Create(ValidEmail, ValidHash, ValidPhone, First, Second, Third, Last, roles);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.ShouldNotBeNull();
        result.Value.Email.Value.ShouldBe(ValidEmail.ToLowerInvariant());
        result.Value.Status.ShouldBe(UserStatus.Active);
        result.Value.IsBidder.ShouldBeTrue();
        result.Value.IsSeller.ShouldBeFalse();
    }

    [Fact]
    public void Create_Should_FailFast_When_ValueObjectValidationFails()
    {
        // Act - Invalid email string breaks the chain at step 1
        var result = User.Create("invalid-email-format", ValidHash, ValidPhone, First, Second, Third, Last, new());

        // Assert
        result.IsFailure.ShouldBeTrue();
    }

    #endregion

    #region 2. State Mutation & Domain Events

    [Fact]
    public void ChangeEmail_Should_ModifyEmailAndRaiseDomainEvent_When_EmailIsNew()
    {
        // Arrange
        var user = CreateTestUser();
        var newEmail = Email.Create("new.email@mazadzone.com").Value;

        // Act
        user.ChangeEmail(newEmail);

        // Assert
        user.Email.ShouldBe(newEmail);
        
        // Assert domain event was successfully raised
        var domainEvent = user.DomainEvents.OfType<UserEmailChangedDomainEvent>().FirstOrDefault();
        domainEvent.ShouldNotBeNull();
        domainEvent.UserId.ShouldBe(user.Id);
        domainEvent.NewEmail.ShouldBe(newEmail);
    }

    [Fact]
    public void ChangeEmail_Should_DoNothing_When_EmailIsIdentical()
    {
        // Arrange
        var user = CreateTestUser();
        var identicalEmail = Email.Create(ValidEmail).Value;

        // Act
        user.ChangeEmail(identicalEmail);

        // Assert
        user.DomainEvents.OfType<UserEmailChangedDomainEvent>().ShouldBeEmpty();
    }

    [Fact]
    public void ChangePassword_Should_ModifyHashAndRaiseDomainEvent()
    {
        // Arrange
        var user = CreateTestUser();
        var newHash = PasswordHash.Create("$2a$12$NewSecretHashValueGoesHereString").Value;

        // Act
        user.ChangePassword(newHash);

        // Assert
        user.PasswordHash.ShouldBe(newHash);
        user.DomainEvents.OfType<UserPasswordChangedDomainEvent>().ShouldNotBeEmpty();
    }

    #endregion

    #region 3. Account Enforcement Lifecycle (Suspend / Ban / Activate)

    [Fact]
    public void Suspend_Should_TransitionStatusAndRevokeTokens_When_UserIsActive()
    {
        // Arrange
        var user = CreateTestUser();
        user.AddRefreshToken("token_hash_1");
        var reason = Reason.Create("Policy violation identified.").Value;
        var until = DateTime.UtcNow.AddDays(7);

        // Act
        var result = user.Suspend(reason, until);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        user.Status.ShouldBe(UserStatus.Suspended);
        user.EnforcementReason.ShouldBe(reason);
        user.SuspensionUntil.ShouldBe(until);
        user.HashedRefreshTokens.Any(t => t.IsActive).ShouldBeFalse(); // Verifies implicit session wipe
        user.DomainEvents.OfType<UserSuspendedDomainEvent>().ShouldNotBeEmpty();
    }

    [Fact]
    public void Suspend_Should_ReturnAlreadySuspended_When_UserIsAlreadySuspended()
    {
        // Arrange
        var user = CreateTestUser();
        var reason = Reason.Create(TestingReason).Value;

        // First suspension to set up the state
        user.Suspend(reason, DateTime.UtcNow.AddDays(1));

        // Act
        var result = user.Suspend(reason, DateTime.UtcNow.AddDays(1));

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(UserErrors.AlreadySuspended);
    }

    [Fact]
    public void Suspend_Should_ReturnCannotSuspendBannedUser_When_UserIsBanned()
    {
        // Arrange
        var user = CreateTestUser();
        var reason = Reason.Create(TestingReason).Value;

        // Permanently ban the user to set up the boundary state
        user.Ban(reason);

        // Act
        var result = user.Suspend(reason, DateTime.UtcNow.AddDays(1));

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(UserErrors.CannotSuspendBannedUser);
    }

    [Fact]
    public void Ban_Should_PermanentlyLockUserAndRaiseDomainEvent_When_UserIsNotBanned()
    {
        // Arrange
        var user = CreateTestUser();
        var reason = Reason.Create(TestingReason).Value;

        // Act
        var result = user.Ban(reason);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        user.Status.ShouldBe(UserStatus.Banned);
        user.EnforcementReason.ShouldBe(reason);

        // Verify the domain event was raised exactly once
        user.DomainEvents.OfType<UserBannedDomainEvent>().Count().ShouldBe(1);
    }

    [Fact]
    public void Ban_Should_BeIdempotentAndNotRaiseDuplicateEvents_When_UserIsAlreadyBanned()
    {
        // Arrange
        var user = CreateTestUser();
        var reason = Reason.Create(TestingReason).Value;

        // First ban to lock the state
        user.Ban(reason);

        // Clear the domain events queue so we can track if the second call raises new ones
        user.ClearDomainEvents();

        // Act
        var redundantResult = user.Ban(reason);

        // Assert
        redundantResult.IsSuccess.ShouldBeTrue();
        user.Status.ShouldBe(UserStatus.Banned); // State remains unchanged

        // 🧠 CRITICAL ASSERTION: Ensure NO new domain event was raised on the redundant call
        user.DomainEvents.OfType<UserBannedDomainEvent>().ShouldBeEmpty();
    }

    [Fact]
    public void Activate_Should_RestoreStatusAndRaiseDomainEvent_When_UserIsSuspended()
    {
        // Arrange
        var user = CreateTestUser();
        var reason = Reason.Create("TestingReason").Value;
        user.Suspend(reason, DateTime.UtcNow.AddDays(5));

        // Clear the suspension domain event to cleanly track only the activation event
        user.ClearDomainEvents();

        // Act
        var result = user.Activate();

        // Assert
        result.IsSuccess.ShouldBeTrue();
        user.Status.ShouldBe(UserStatus.Active);
        user.SuspensionUntil.ShouldBeNull();

        // Verify the activation event was raised exactly once
        user.DomainEvents.OfType<UserActivatedDomainEvent>().Count().ShouldBe(1);
    }

    [Fact]
    public void Activate_Should_BeIdempotentAndNotRaiseEvents_When_UserIsAlreadyActive()
    {
        // Arrange
        var user = CreateTestUser(); // Default state from helper is Active
        user.ClearDomainEvents();

        // Act
        var result = user.Activate();

        // Assert
        result.IsSuccess.ShouldBeTrue(); // Matches your new 'return Result.Success()' logic
        user.Status.ShouldBe(UserStatus.Active);

        // CRITICAL: Ensure no redundant activation event is fired into your event bus
        user.DomainEvents.OfType<UserActivatedDomainEvent>().ShouldBeEmpty();
    }

    [Fact]
    public void Activate_Should_ReturnCannotActivateBannedUser_When_UserIsBanned()
    {
        // Arrange
        var user = CreateTestUser();
        var reason = Reason.Create("TestingReason").Value;
        user.Ban(reason);
        user.ClearDomainEvents();

        // Act
        var result = user.Activate();

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(UserErrors.CannotActivateBannedUser);

        // Verify state invariants remain untouched
        user.Status.ShouldBe(UserStatus.Banned);
        user.DomainEvents.OfType<UserActivatedDomainEvent>().ShouldBeEmpty();
    }

    #endregion

    #region 4. Authentication Session & Token Management

    [Fact]
    public void AddRefreshToken_Should_DenyAuthentication_When_UserIsBanned()
    {
        // Arrange
        var user = CreateTestUser();
        user.Ban(Reason.Create(TestingReason).Value);

        // Act
        var result = user.AddRefreshToken("token_hash");

        // Assert
        result.TopError.ShouldBe(UserErrors.CannotAuthenticateBannedUser);
    }

    [Fact]
    public void AddRefreshToken_Should_Fail_When_SuspensionIsActive()
    {
        // Arrange
        var user = CreateTestUser();
        var reason = Reason.Create(TestingReason).Value;
        user.Suspend(reason, DateTime.UtcNow.AddDays(1));

        // Act
        var result = user.AddRefreshToken("token_hash");

        // Assert
        result.TopError.ShouldBe(UserErrors.UserIsSuspended);
    }

    [Fact]
    public void AddRefreshToken_Should_AutoActivateAndSucceed_When_SuspensionLifespanHasExpired()
    {
        // Arrange
        var user = CreateTestUser();
        var reason = Reason.Create(TestingReason).Value;
        // Set suspension expiration to the past
        user.Suspend(reason, DateTime.UtcNow.AddMinutes(-10));

        // Act
        var result = user.AddRefreshToken("token_hash");

        // Assert
        result.IsSuccess.ShouldBeTrue();
        user.Status.ShouldBe(UserStatus.Active); // Auto-activation triggered successfully
        user.HashedRefreshTokens.Count.ShouldBe(1);
    }

    [Fact]
    public void AddRefreshToken_Should_SucceedAndAppendToken_When_UserIsActive()
    {
        // Arrange
        var user = CreateTestUser(); // Default state from helper is Active
        string targetTokenHash = "clean_active_session_hash";

        // Verify initial state preconditions
        user.Status.ShouldBe(UserStatus.Active);
        user.HashedRefreshTokens.ShouldBeEmpty();

        // Act
        var result = user.AddRefreshToken(targetTokenHash);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        user.HashedRefreshTokens.Count.ShouldBe(1);

        // Verify the tracking properties inside the assigned token entity
        var assignedToken = user.HashedRefreshTokens.First();
        assignedToken.Token.ShouldBe(targetTokenHash);
        assignedToken.UserId.ShouldBe(user.Id);
        assignedToken.IsActive.ShouldBeTrue();
    }

    [Fact]
    public void AddRefreshToken_Should_AllowMultipleActiveSessions_When_UserRemainsActive()
    {
        // Arrange
        var user = CreateTestUser();

        // Act - Simulate a user logging in from two different devices (e.g., Mobile and Web)
        var resultOne = user.AddRefreshToken("device_web_hash");
        var resultTwo = user.AddRefreshToken("device_mobile_hash");

        // Assert
        resultOne.IsSuccess.ShouldBeTrue();
        resultTwo.IsSuccess.ShouldBeTrue();

        user.HashedRefreshTokens.Count.ShouldBe(2);
        user.HashedRefreshTokens.Any(t => t.Token == "device_web_hash" && t.IsActive).ShouldBeTrue();
        user.HashedRefreshTokens.Any(t => t.Token == "device_mobile_hash" && t.IsActive).ShouldBeTrue();
    }

    [Fact]
    public void InvalidateSession_Should_RevokeAllTokens_When_InvalidateAllIsTrue()
    {
        // Arrange
        var user = CreateTestUser();
        user.AddRefreshToken("token_1");
        user.AddRefreshToken("token_2");

        // Act
        user.InvalidateSession("token_1", invalidateAll: true);

        // Assert
        user.HashedRefreshTokens.Any(t => t.IsActive).ShouldBeFalse();
    }

    [Fact]
    public void RotateRefreshToken_Should_ReplaceTokenAndEnforceMaxSessions()
    {
        // Arrange
        var user = CreateTestUser();
        string oldToken = "old_token_hash";
        string newToken = "new_token_hash";
        
        user.AddRefreshToken(oldToken);

        // Act
        var result = user.RotateRefreshToken(oldToken, newToken);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.Token.ShouldBe(newToken);
        
        // Old token must be revoked
        var oldTokenEntity = user.HashedRefreshTokens.FirstOrDefault(t => t.Token == oldToken);
        oldTokenEntity!.IsActive.ShouldBeFalse();
    }

    [Fact]
    public void RotateRefreshToken_Should_Fail_When_OldTokenIsNotFoundOrInactive()
    {
        // Arrange
        var user = CreateTestUser();

        // Act
        var result = user.RotateRefreshToken("non_existent_token", "new_token");

        // Assert
        result.TopError.ShouldBe(UserErrors.InvalidToken);
    }

    #endregion

    #region 5. Role Customization Matrix

    [Fact]
    public void RoleOperations_Should_ModifyRolesHashSetCorrectly_WithoutDuplicates()
    {
        // Arrange
        var user = CreateTestUser(); // starts with empty list roles in factory helper below

        // Act & Assert for AddRole
        user.AddRole(UserRole.Bidder);
        user.Roles.Count.ShouldBe(1);
        user.IsBidder.ShouldBeTrue();

        // Add duplicate role variant check
        user.AddRole(UserRole.Bidder);
        user.Roles.Count.ShouldBe(1); // Set keeps count flat

        // Act & Assert for AddSellerRole shortcut method
        user.AddSellerRole();
        user.IsSeller.ShouldBeTrue();
        user.Roles.Count.ShouldBe(2);

        // Redundant seller add step
        user.AddSellerRole();
        user.Roles.Count.ShouldBe(2);

        // Act & Assert for RemoveRole
        user.RemoveRole(UserRole.Bidder);
        user.IsBidder.ShouldBeFalse();
        user.Roles.Count.ShouldBe(1);

        // Redundant remove path verification
        user.RemoveRole(UserRole.Bidder);
        user.Roles.Count.ShouldBe(1);
    }

    #endregion
    
#region 1. General Role Addition & Idempotency Tests

[Fact]
public void AddRole_Should_AppendRole_When_UserDoesNotAlreadyHaveIt()
{
    // Arrange
    var user = CreateTestUser(); // Starts with an empty roles collection
    user.Roles.ShouldBeEmpty();

    // Act
    user.AddRole(UserRole.Admin);

    // Assert
    user.Roles.Count.ShouldBe(1);
    user.Roles.Contains(UserRole.Admin).ShouldBeTrue();
}

[Fact]
public void AddRole_Should_BeIdempotentAndDoNothing_When_UserAlreadyHasTheRole()
{
    // Arrange
    var user = CreateTestUser();
    user.AddRole(UserRole.Admin);
    user.Roles.Count.ShouldBe(1);

    // Act
    user.AddRole(UserRole.Admin);

    // Assert
    user.Roles.Count.ShouldBe(1); // HashSet naturally prevents duplicates, guard clause handles bypass
}

#endregion

#region 2. Explicit Shortcut Role Assignment Tests

[Fact]
public void AddSellerRole_Should_AddSellerRoleAndSetFlag_When_NotAlreadySeller()
{
    // Arrange
    var user = CreateTestUser();
    user.IsSeller.ShouldBeFalse();

    // Act
    user.AddSellerRole();

    // Assert
    user.IsSeller.ShouldBeTrue();
    user.Roles.Contains(UserRole.Seller).ShouldBeTrue();
    user.Roles.Count.ShouldBe(1);
}

[Fact]
public void AddSellerRole_Should_DoNothing_When_UserIsAlreadySeller()
{
    // Arrange
    var user = CreateTestUser();
    user.AddSellerRole();
    user.Roles.Count.ShouldBe(1);

    // Act
    user.AddSellerRole();

    // Assert
    user.Roles.Count.ShouldBe(1);
    user.IsSeller.ShouldBeTrue();
}

[Fact]
public void AddBidderRole_Should_AddBidderRoleAndSetFlag_When_NotAlreadyBidder()
{
    // Arrange
    var user = CreateTestUser();
    user.IsBidder.ShouldBeFalse();

    // Act
    user.AddBidderRole();

    // Assert
    user.IsBidder.ShouldBeTrue();
    user.Roles.Contains(UserRole.Bidder).ShouldBeTrue();
    user.Roles.Count.ShouldBe(1);
}

[Fact]
public void AddBidderRole_Should_DoNothing_When_UserIsAlreadyBidder()
{
    // Arrange
    var user = CreateTestUser();
    user.AddBidderRole();
    user.Roles.Count.ShouldBe(1);

    // Act
    user.AddBidderRole();

    // Assert
    user.Roles.Count.ShouldBe(1);
    user.IsBidder.ShouldBeTrue();
}

#endregion

#region 3. Role Removal Validation Tests

[Fact]
public void RemoveRole_Should_ExtractRoleFromCollection_When_UserHasTheTargetRole()
{
    // Arrange
    var user = CreateTestUser();
    user.AddRole(UserRole.Admin);
    user.Roles.Contains(UserRole.Admin).ShouldBeTrue();

    // Act
    user.RemoveRole(UserRole.Admin);

    // Assert
    user.Roles.ShouldBeEmpty();
    user.Roles.Contains(UserRole.Admin).ShouldBeFalse();
}

[Fact]
public void RemoveRole_Should_DoNothing_When_UserDoesNotHaveTheTargetRole()
{
    // Arrange
    var user = CreateTestUser();
    user.AddRole(UserRole.Bidder);
    user.Roles.Count.ShouldBe(1);

    // Act - Try to remove a role the user doesn't possess
    user.RemoveRole(UserRole.Seller);

    // Assert
    user.Roles.Count.ShouldBe(1);
    user.Roles.Contains(UserRole.Bidder).ShouldBeTrue();
    user.Roles.Contains(UserRole.Seller).ShouldBeFalse();
}

#endregion


    // --- Core Factory Helper ---
    private static User CreateTestUser()
    {
        return User.Create(
            ValidEmail, 
            ValidHash, 
            ValidPhone, 
            First, 
            Second, 
            Third, 
            Last, 
            new HashSet<UserRole>()).Value;
    }
}