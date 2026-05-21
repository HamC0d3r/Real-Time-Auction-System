using MazadZone.Application.Features.Users.Commands.Ban;
using MazadZone.Domain.Users.ValueObjects;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace MazadZone.Api.Endpoints.Users;

public record BanUserRequest(string Reason);

public static class Ban
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/{id:guid}/ban", HandleAsync)
           .RequireAuthorization("AdminOnly")
           .WithTags("User Management")
           .WithSummary("Ban a user account")
           .Produces(StatusCodes.Status204NoContent)
           .ProducesProblem(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> HandleAsync(
        [FromRoute] UserId id,
        [FromBody] BanUserRequest request,
        [FromServices] ISender sender,
        CancellationToken ct)
    {
        var command = new BanUserCommand(id, request.Reason);
        var result = await sender.Send(command, ct);
        return result.Match(_ => Results.NoContent(), e => e.ToProblem());
    }
}