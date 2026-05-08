using MazadZone.Domain.Repositories;
using MazadZone.Domain.Users;
using MazadZone.Domain.Users.Errors;
using MazadZone.Features.Users.ChangeEmail;

namespace MazadZone.Application.Features.Users.Commands.ChangeEmail;

public class ChangeEmailCommandHandler : ICommandHandler<ChangeEmailCommand, Unit>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<ChangeEmailCommandHandler> _logger;

    public ChangeEmailCommandHandler(
        IUnitOfWork unitOfWork,
        ILogger<ChangeEmailCommandHandler> logger,
        IUserRepository userRepository
        )
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _userRepository = userRepository;
    }

    public async Task<Result<Unit>> Handle(ChangeEmailCommand command, CancellationToken cancellationToken)
    {
        var newEmailResult = Email.Create(command.NewEmail);
        if (newEmailResult.IsFailure) return newEmailResult.TopError;
        var newEmail = newEmailResult.Value;

        if (await _userRepository.IsEmailInUseAsync(newEmail, cancellationToken))
        {
            ChangeEmailLogs.LogConflict(_logger, newEmail.Value, EmailErrorCodes.AlreadyInUse);
            return EmailErrors.AlreadyInUse;
        }

        var user = await _userRepository.GetByIdAsync(command.UserId.Value, cancellationToken);

        if (user is null)
        {
            GlobalLogs.LogUserNotFound(_logger, command.UserId);
            return UserErrors.NotFound;
        }

        user.ChangeEmail(newEmail);

        _userRepository.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        ChangeEmailLogs.LogSuccess(_logger, command.UserId, command.NewEmail);

        return Unit.Value;
    }
}
