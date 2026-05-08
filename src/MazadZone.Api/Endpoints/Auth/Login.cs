using MazadZone.Application.Features.Authentication.Commands.Login;
using MazadZone.Application.Features.Authentication.DTOs;

namespace MazadZone.Api.Endpoints.Auth;

public sealed record LoginRequest(string Email, string Password);

public static class Login
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("login", LoginAsync)
           .Produces<TokenDto>(StatusCodes.Status200OK)
           .ProducesProblem(StatusCodes.Status401Unauthorized)
           .WithSummary("User login to obtain access tokens");
    }

    private static async Task<IResult> LoginAsync(
        [FromBody] LoginRequest request,
        [FromServices] ISender sender,
        CancellationToken ct)
    {
        var result = await sender.Send(new LoginCommand(request.Email, request.Password), ct);

        return result.Match(
            onValue: value => Results.Ok(value),
            onError: errors => errors.ToProblem()
        );
    }
}