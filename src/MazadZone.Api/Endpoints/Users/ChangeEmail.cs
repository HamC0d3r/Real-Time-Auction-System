using MazadZone.Application.Features.Users.Commands.ChangeEmail;
using MazadZone.Domain.Users.ValueObjects;

namespace MazadZone.Api.Endpoints.Users;

public record ChangeEmailRequest(string NewEmail);

public static class ChangeEmail
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("/users/email", ChangeEmailAsync)
           .Produces(StatusCodes.Status204NoContent)
           .ProducesProblem(StatusCodes.Status409Conflict)
           .WithSummary("Change user email");
    }

    private static async Task<IResult> ChangeEmailAsync(
        [FromBody] ChangeEmailRequest request,
        IHttpContextAccessor context,
        ISender sender,
        CancellationToken ct)
    {
        var userId = context.HttpContext?.User.GetUserId() ?? Guid.Empty;
        var result = await sender.Send(new ChangeEmailCommand(UserId.Load(userId), request.NewEmail), ct);
        return result.Match(_ => Results.NoContent(), e => e.ToProblem());
    }
}