using AuthService.Application.Interfaces;
using MazadZone.Application.Features.Authentication.Commands.Login;
using MazadZone.Application.Features.Users.Commands.ChangePassword;
using MazadZone.Domain.Repositories;
using MazadZone.Domain.Users;
using MazadZone.Domain.Users.Errors;

namespace AuthService.Application.Features.Users.Commands.ChangePassword;

public class ChangePasswordCommandHandler : ICommandHandler<ChangePasswordCommand, Unit>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserRepository _userRepo;
    private readonly IPasswordService _passwordService;
    private readonly ILogger<ChangePasswordCommandHandler> _logger;

    public ChangePasswordCommandHandler(
        IUnitOfWork unitOfWork,
        IPasswordService passwordService,
        ILogger<ChangePasswordCommandHandler> logger,
        IUserRepository userRepo

    )
    {
        _unitOfWork = unitOfWork;
        _passwordService = passwordService;
        _logger = logger;
        _userRepo = userRepo;
    }

    async Task<Result<Unit>> IRequestHandler<ChangePasswordCommand, Result<Unit>>.Handle(ChangePasswordCommand request, CancellationToken ct)
    {
        var user = await _userRepo.GetByIdAsync(request.UserId.Value, ct);

        if (user is null)
        {
            GlobalLogs.LogUserNotFound(_logger, request.UserId);
            return UserErrors.NotFound;
        }

        if (!_passwordService.ValidatePassword(request.CurrentPassword, user.PasswordHash.Value))
        {
            GlobalLogs.LogInvalidPassword(_logger, user.Id);
            return UserErrors.InvalidCredentials;
        }

        var hashNewPasswordResult = PasswordHash.Create(_passwordService.HashPassword(request.NewPassword));
        if (hashNewPasswordResult.IsFailure)
        {
            ChangePasswordLogs.LogHashingError(_logger, request.UserId, hashNewPasswordResult.TopError.Code);
            return UserErrors.InvalidCredentials;
        }

        user.ChangePassword(hashNewPasswordResult.Value);
        _userRepo.Update(user);

        await _unitOfWork.SaveChangesAsync(ct);

        ChangePasswordLogs.LogSuccess(_logger, request.UserId);

        return Unit.Value;
    }
}
