using MazadZone.Application.Features.Authentication.Commands.RefreshToken;
using MazadZone.Application.Features.Authentication.DTOs;

namespace MazadZone.Api.Endpoints.Auth;

public sealed record RefreshTokenRequest(string RefreshToken);

public static class Refresh
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("refresh", RefreshAsync)
           .Produces<TokenDto>(StatusCodes.Status200OK)
           .ProducesProblem(StatusCodes.Status401Unauthorized)
           .WithSummary("Refresh an expired access token");
    }

    private static async Task<IResult> RefreshAsync(
        [FromBody] RefreshTokenRequest request,
        [FromServices] ISender sender,
        CancellationToken ct)
    {
        var result = await sender.Send(new RefreshTokenCommand(request.RefreshToken), ct);

        return result.Match(
            onValue: value => Results.Ok(value),
            onError: errors => errors.ToProblem()
        );
    }
}