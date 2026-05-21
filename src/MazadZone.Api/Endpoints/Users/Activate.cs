using MazadZone.Application.Features.Users.Commands.Activate;
using MazadZone.Domain.Users.ValueObjects;

namespace MazadZone.Api.Endpoints.Users;

public static class Activate
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/{id:guid}/activate", HandleAsync)
           .RequireAuthorization("AdminOnly")
           .WithTags("User Management")
           .WithSummary("Activate a user account")
           .Produces(StatusCodes.Status204NoContent)
           .ProducesProblem(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> HandleAsync(
        [FromRoute]UserId id,
        [FromServices]ISender sender,
        CancellationToken ct)
    {
        var result = await sender.Send(new ActivateUserCommand(id), ct);
        return result.Match(_ => Results.NoContent(), e => e.ToProblem());
    }
}