using MazadZone.Application.Users.Commands.CreateAdminUser; // Namespace from the previous step

namespace MazadZone.Api.Endpoints.Users;

public static class CreateAdmin
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/admin", HandleAsync)
           .RequireAuthorization(Policies.AdminOnly) // Ensure only Admins can access this endpoint
           .WithSummary("Create an Admin user account")
           .WithDescription("Registers a new user with administrative privileges. Validates incoming payload constraints and returns the newly created User ID upon success.")
           .Produces<Guid>(StatusCodes.Status201Created)
           .ProducesValidationProblem(StatusCodes.Status400BadRequest)  // FluentValidation failures
           .ProducesProblem(StatusCodes.Status401Unauthorized)          // Missing or invalid token
           .ProducesProblem(StatusCodes.Status403Forbidden)             // Valid token, but lacking Admin rights
           .ProducesProblem(StatusCodes.Status409Conflict)              // Email 
           .ProducesProblem(StatusCodes.Status500InternalServerError);
    }

    private static async Task<IResult> HandleAsync(
        [FromBody] CreateAdminUserCommand command,
        [FromServices] ISender sender,
        CancellationToken ct)
    {
        var result = await sender.Send(command, ct);
        
        return result.Match(
            userId => Results.Created($"/api/users/{userId}", userId),
            error => error.ToProblem());
    }
}