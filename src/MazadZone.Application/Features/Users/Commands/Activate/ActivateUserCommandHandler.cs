using MazadZone.Domain.Repositories;
using MazadZone.Domain.Users.Errors;

namespace MazadZone.Application.Features.Users.Commands.Activate;
public class ActivateUserCommandHandler : ICommandHandler<ActivateUserCommand, Unit>
{
    private readonly IUserRepository _userRepo;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ActivateUserCommandHandler> _logger;

    public ActivateUserCommandHandler(
        IUserRepository userRepo,
        IUnitOfWork unitOfWork,
        ILogger<ActivateUserCommandHandler> logger
    )
    {
        _userRepo = userRepo;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(ActivateUserCommand request, CancellationToken ct)
    {
        var user = await _userRepo.GetByIdAsync(request.UserId.Value, ct);

        if (user is null)
        {
            GlobalLogs.LogUserNotFound(_logger, request.UserId);
            return UserErrors.NotFound;
        }

        var result = user.Activate();
        if (result.IsFailure)
        {
            ActivateUserLogs.LogDomainViolation(_logger, request.UserId, result.TopError.Code);
            return result.TopError;
        }

        _userRepo.Update(user);
        await _unitOfWork.SaveChangesAsync(ct);

        ActivateUserLogs.LogSuccess(_logger, request.UserId);   

        return Unit.Value;
    }
}