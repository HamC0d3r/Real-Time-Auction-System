using MazadZone.Application.Features.Users.Commands.Suspend;
using MazadZone.Domain.Users.ValueObjects;

namespace MazadZone.Api.Endpoints.Users;

public record SuspendUserRequest(string Reason,DateTime Until);

public static class Suspend
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/{id:guid}/suspend", HandleAsync)
           .RequireAuthorization("AdminOnly")
           .WithTags("User Management")
           .WithSummary("Suspend a user account until a specific date")
           .Produces(StatusCodes.Status204NoContent)
           .ProducesProblem(StatusCodes.Status400BadRequest);
    }

    private static async Task<IResult> HandleAsync(
        [FromRoute]UserId id,
        [FromBody] SuspendUserRequest request,
        [FromServices]ISender sender,
        CancellationToken ct)
    {
        var result = await sender.Send(new SuspendUserCommand(id, request.Reason ,request.Until), ct);
        return result.Match(_ => Results.NoContent(), e => e.ToProblem());
    }
}