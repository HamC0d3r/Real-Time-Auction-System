using MazadZone.Domain.Repositories;
using MazadZone.Domain.Users.Errors;

namespace MazadZone.Application.Features.Users.Commands.Suspend;
public class SuspendUserCommandHandler : ICommandHandler<SuspendUserCommand, Unit>
{
    private readonly IUserRepository _userRepo;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<SuspendUserCommandHandler> _logger;

    public SuspendUserCommandHandler(
        IUserRepository userRepo,
        IUnitOfWork unitOfWork,
        ILogger<SuspendUserCommandHandler> logger
    )
    {
        _userRepo = userRepo;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(SuspendUserCommand request, CancellationToken ct)
    {
        var user = await _userRepo.GetByIdAsync(request.UserId.Value, ct);
        if (user is null)
        {
            GlobalLogs.LogUserNotFound(_logger, request.UserId);
            return UserErrors.NotFound;
        }

        var reasonResult = Reason.Create(request.Reason);
        if (reasonResult.IsFailure) return reasonResult.TopError;

        var result = user.Suspend(reasonResult.Value,request.Until);
        if (result.IsFailure)
        {
            SuspendUserLogs.LogDomainViolation(_logger, request.UserId, result.TopError.Code);
            return result.TopError;
        }

        _userRepo.Update(user);
        await _unitOfWork.SaveChangesAsync(ct);

        SuspendUserLogs.LogSuccess(_logger, user.Id, request.Until);

        return Unit.Value;
    }
}