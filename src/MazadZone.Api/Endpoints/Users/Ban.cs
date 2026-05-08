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
        app.MapPost("/{id:guid}/ban", BanAsync)
           .RequireAuthorization("AdminOnly")
           .Produces(StatusCodes.Status204NoContent)
           .ProducesProblem(StatusCodes.Status404NotFound)
           .WithSummary("Ban a user account");
    }

    private static async Task<IResult> BanAsync(
        Guid id,
        [FromBody] BanUserRequest request,
        ISender sender,
        CancellationToken ct)
    {
        var command = new BanUserCommand(UserId.Load(id), request.Reason);
        var result = await sender.Send(command, ct);
        return result.Match(_ => Results.NoContent(), e => e.ToProblem());
    }
}