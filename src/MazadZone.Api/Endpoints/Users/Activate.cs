using MazadZone.Application.Features.Users.Commands.Activate;
using MazadZone.Domain.Users.ValueObjects;

namespace MazadZone.Api.Endpoints.Users;

public static class Activate
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/{id:guid}/activate", ActivateAsync)
           .RequireAuthorization("AdminOnly")
           .Produces(StatusCodes.Status204NoContent)
           .ProducesProblem(StatusCodes.Status404NotFound)
           .WithSummary("Activate a user account");
    }

    private static async Task<IResult> ActivateAsync(
        Guid id,
        ISender sender,
        CancellationToken ct)
    {
        var result = await sender.Send(new ActivateUserCommand(UserId.Load(id)), ct);
        return result.Match(_ => Results.NoContent(), e => e.ToProblem());
    }
}