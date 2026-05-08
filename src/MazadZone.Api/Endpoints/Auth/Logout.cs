using MazadZone.Application.Features.Authentication.Commands.Logout;
using MazadZone.Domain.Users.ValueObjects;
using System.Security.Claims;

namespace MazadZone.Api.Endpoints.Auth;

public sealed record LogoutRequest(string RefreshToken, bool IsLogoutFromAllDevices);

public static class Logout
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("logout", LogoutAsync)
           .RequireAuthorization()
           .Produces(StatusCodes.Status204NoContent)
           .ProducesProblem(StatusCodes.Status401Unauthorized)
           .WithSummary("Invalidate user session");
    }

    private static async Task<IResult> LogoutAsync(
        [FromBody] LogoutRequest request,
        [FromServices] ISender sender,
        ClaimsPrincipal userPrincipal,
        CancellationToken ct)
    {
        var userId = userPrincipal.GetUserId();

        var command = new LogoutCommand(
            UserId.Load(userId),
            request.RefreshToken,
            request.IsLogoutFromAllDevices);

        var result = await sender.Send(command, ct);

        return result.Match(
            onValue: _ => Results.NoContent(),
            onError: errors => errors.ToProblem()
        );
    }
}