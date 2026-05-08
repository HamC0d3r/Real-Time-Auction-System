using MazadZone.Application.Features.Users.Commands.ChangePassword;
using MazadZone.Domain.Users.ValueObjects;

namespace MazadZone.Api.Endpoints.Users;

public record ChangePasswordRequest(
    string CurrentPassword,
    string NewPassword,
    string ConfirmNewPassword);

public static class ChangePassword
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/change-password", ChangePasswordAsync)
           .Produces(StatusCodes.Status204NoContent)
           .ProducesProblem(StatusCodes.Status401Unauthorized)
           .WithSummary("Change user password");
    }

    private static async Task<IResult> ChangePasswordAsync(
        [FromBody] ChangePasswordRequest request,
        IHttpContextAccessor context,
        ISender sender,
        CancellationToken ct)
    {
        var userId = context.HttpContext?.User.GetUserId() ?? Guid.Empty;
        var command = new ChangePasswordCommand(
            UserId.Load(userId), 
            request.CurrentPassword, 
            request.NewPassword, 
            request.ConfirmNewPassword);

        var result = await sender.Send(command, ct);
        return result.Match(_ => Results.NoContent(), e => e.ToProblem());
    }
}