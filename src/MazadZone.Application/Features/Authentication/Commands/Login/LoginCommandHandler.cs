using AuthService.Application.Interfaces;
using MazadZone.Application.Features.Authentication.Commands.Login;
using MazadZone.Application.Features.Authentication.DTOs;
using MazadZone.Application.Services;
using MazadZone.Domain.Repositories;
using MazadZone.Domain.Users;
using MazadZone.Domain.Users.Errors;

namespace MazadZone.Application.Features.Users.Commands.Login;

public class LoginCommandHandler : ICommandHandler<LoginCommand, TokenDto>
{
    private readonly IPasswordService _passwordService;
    private readonly ITokenProvider _tokenProvider;
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<LoginCommandHandler> _logger;

    public LoginCommandHandler(
        IPasswordService passwordService,
        ITokenProvider tokenProvider,
        IUserRepository userRepository,
        IUnitOfWork unitOfWork,
        ILogger<LoginCommandHandler> logger
    )
    {
        _passwordService = passwordService;
        _tokenProvider = tokenProvider;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<TokenDto>> Handle(LoginCommand request, CancellationToken ct)
{
    var emailResult = Email.Create(request.Email);
    if (emailResult.IsFailure) return emailResult.TopError;

    var user = await _userRepository.GetByEmailAsync(emailResult.Value, ct);

    if (user is null)
    {
        LoginLogs.LogUserNotFound(_logger, request.Email);
        return UserErrors.InvalidCredentials; 
    }

    if (!_passwordService.ValidatePassword(request.Password, user.PasswordHash.Value))
    {
        GlobalLogs.LogInvalidPassword(_logger, user.Id);
        return UserErrors.InvalidCredentials;
    }

    var accessToken = _tokenProvider.GenerateAccessToken(user);
    var rawRefreshToken = _tokenProvider.GenerateRefreshToken();
    var hashedRefreshToken = _tokenProvider.HashToken(rawRefreshToken);

    var addRefreshResult = user.AddRefreshToken(hashedRefreshToken);
    
    if (addRefreshResult.IsFailure) 
    {
        LoginLogs.LogAddRefreshTokenFailed(_logger, user.Id.Value, addRefreshResult.TopError.Code);
        return addRefreshResult.TopError;
    }

    await _unitOfWork.SaveChangesAsync(ct);

    LoginLogs.LogLoginSuccess(_logger, user.Id.Value);

    return new TokenDto(accessToken, rawRefreshToken);
}
}

