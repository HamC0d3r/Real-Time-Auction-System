using MazadZone.Domain.Users.ValueObjects;

namespace MazadZone.Application.Features.Users.Commands.ChangePassword;

public record ChangePasswordCommand(
    UserId  UserId,
    string CurrentPassword,
    string NewPassword,
    string ConfirmNewPassword

) : ICommand<Unit>;
