using MazadZone.Application.Features.Users.Commands.BulkActivate;

namespace MazadZone.Api.Endpoints.Users;

public record BulkActivateRequest(List<UserId> UserIds);

public static class BulkActivate
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        // Using PUT to a collection-level sub-resource
        app.MapPut("/bulk-activate", HandleAsync)
           .RequireAuthorization(Policies.AdminOnly)
           .WithSummary("Bulk activate multiple user accounts")
           .WithDescription("Reactivates multiple previously suspended or inactive user accounts. Returns a 409 Conflict if any user in the batch is already active (transaction aborted).")
           .Produces(StatusCodes.Status204NoContent)
           .ProducesValidationProblem(StatusCodes.Status400BadRequest) // Malformed GUIDs or > 100 users
           .ProducesProblem(StatusCodes.Status401Unauthorized) 
           .ProducesProblem(StatusCodes.Status403Forbidden) 
           .ProducesProblem(StatusCodes.Status404NotFound) // Users not found
           .ProducesProblem(StatusCodes.Status409Conflict) // Domain rule violation (e.g., account already banned)
           .ProducesProblem(StatusCodes.Status500InternalServerError);
    }

    private static async Task<IResult> HandleAsync(
        [FromBody] BulkActivateRequest request,
        [FromServices] ISender sender,
        CancellationToken ct)
    {
        var result = await sender.Send(new BulkActivateUsersCommand(request.UserIds), ct);
        
        return result.Match(
            _ => Results.NoContent(),
            e => e.ToProblem());
    }
}