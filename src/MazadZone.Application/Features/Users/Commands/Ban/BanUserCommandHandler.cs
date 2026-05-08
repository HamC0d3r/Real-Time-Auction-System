using MazadZone.Domain.Repositories;
using MazadZone.Domain.Users.Errors;

namespace MazadZone.Application.Features.Users.Commands.Ban;

public class BanUserCommandHandler : ICommandHandler<BanUserCommand, Unit>
{
    private readonly IUserRepository _userRepo;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<BanUserCommandHandler> _logger;

    public BanUserCommandHandler(
        IUserRepository userRepo,
        IUnitOfWork unitOfWork,
        ILogger<BanUserCommandHandler> logger
    )
    {
        _userRepo = userRepo;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(BanUserCommand request, CancellationToken ct)
    {
        var user = await _userRepo.GetByIdAsync(request.UserId.Value, ct);
        if (user is null)
        {
            GlobalLogs.LogUserNotFound(_logger, request.UserId);
            return UserErrors.NotFound;
        }

        var reasonResult = Reason.Create(request.Reason);
        if (reasonResult.IsFailure) return reasonResult.TopError;

        var result = user.Ban(reasonResult.Value);
        if (result.IsFailure)
        {
            BanUserLogs.LogDomainViolation(_logger, request.UserId, result.TopError.Code);
            return result.TopError;
        }

        _userRepo.Update(user);
        await _unitOfWork.SaveChangesAsync(ct);

        BanUserLogs.LogSuccess(_logger, request.UserId, request.Reason);
        return Unit.Value;
    }
}