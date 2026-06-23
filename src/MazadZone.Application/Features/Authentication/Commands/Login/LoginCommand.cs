using MazadZone.Application.Features.Authentication.DTOs;

namespace MazadZone.Application.Features.Authentication.Commands.Login;
public record LoginCommand(
    string Email,
    string Password

) : ICommand<TokenDto>;
