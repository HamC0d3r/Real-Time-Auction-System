using MazadZone.Application.Services;
using MazadZone.Domain.Repositories;
using MazadZone.Domain.Users.Errors;

namespace MazadZone.Application.Features.Authentication.Commands.Logout;

public class LogoutCommandHandler : ICommandHandler<LogoutCommand, Unit>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserRepository _userRepository;
    private readonly ITokenProvider _tokenProvider;
    private readonly ILogger<LogoutCommandHandler> _logger;

    public LogoutCommandHandler(
        IUnitOfWork unitOfWork,
        IUserRepository userRepository,
        ITokenProvider tokenProvider,
        ILogger<LogoutCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _userRepository = userRepository;
        _tokenProvider = tokenProvider;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(LogoutCommand request, CancellationToken ct)
{
    var hashedToken = _tokenProvider.HashToken(request.RefreshToken);

    var user = await _userRepository.GetByIdAsync(request.UserId.Value, ct);
    
    if (user is null)
    {
        GlobalLogs.LogUserNotFound(_logger, request.UserId);
        return UserErrors.NotFound;
    }

    if (request.IsLogoutFromAllDevices)
    {
        user.InvalidateSession(hashedToken, true);
        LogoutLogs.LogLogoutAllDevices(_logger, user.Id.Value);
    }
    else
    {
        // We check if the token exists before invalidating so we can log accurately
        var tokenExists = user.HashedRefreshTokens.Any(t => t.Token == hashedToken && t.IsActive);
        
        user.InvalidateSession(hashedToken, false);

        if (tokenExists)
        {
            LogoutLogs.LogLogoutSuccess(_logger, user.Id.Value, hashedToken);
        }
        else
        {
            LogoutLogs.LogLogoutTokenNotFound(_logger, user.Id.Value, hashedToken);
        }
    }

    _userRepository.Update(user);
    await _unitOfWork.SaveChangesAsync(ct);

    return Unit.Value;
}
}