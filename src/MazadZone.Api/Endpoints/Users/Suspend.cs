using MazadZone.Application.Features.Users.Commands.Suspend;
using MazadZone.Domain.Users.ValueObjects;

namespace MazadZone.Api.Endpoints.Users;

public record SuspendUserRequest(DateTime Until);

public static class Suspend
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/{id:guid}/suspend", SuspendAsync)
           .RequireAuthorization("AdminOnly")
           .Produces(StatusCodes.Status204NoContent)
           .ProducesProblem(StatusCodes.Status400BadRequest)
           .WithSummary("Suspend a user account until a specific date");
    }

    private static async Task<IResult> SuspendAsync(
        Guid id,
        [FromBody] SuspendUserRequest request,
        ISender sender,
        CancellationToken ct)
    {
        var result = await sender.Send(new SuspendUserCommand(UserId.Load(id), request.Until), ct);
        return result.Match(_ => Results.NoContent(), e => e.ToProblem());
    }
}