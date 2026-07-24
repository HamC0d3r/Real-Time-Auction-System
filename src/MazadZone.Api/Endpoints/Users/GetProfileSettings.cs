using MazadZone.Application.Features.Users.Queries.GetProfileSettings;
using MazadZone.Api.Infrastructure.Binding;

namespace MazadZone.Api.Endpoints.Users;

public static class GetProfileSettings
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/{id}/profile-settings", HandleAsync)
           .RequireAuthorization() // Uncomment to restrict to authenticated users
           .WithSummary("Get user profile settings")
           .WithDescription("Retrieves the profile configuration and settings for a given user account.")
           .Produces<ProfileSettingsResponse>(StatusCodes.Status200OK)
           .ProducesValidationProblem(StatusCodes.Status400BadRequest) // Malformed or Empty GUID
           .ProducesProblem(StatusCodes.Status401Unauthorized)          // Missing or invalid token
           .ProducesProblem(StatusCodes.Status404NotFound)             // User settings not found
           .ProducesProblem(StatusCodes.Status500InternalServerError);
    }

    private static async Task<IResult> HandleAsync(
        [FromRoute] UserId id,
        BoundUserId boundUserId,
        [FromServices] ISender sender,
        CancellationToken ct)
    {
        if (id != boundUserId.Value)
        {
            return Results.Forbid();
        }

        var result = await sender.Send(new GetProfileSettingsQuery(id), ct);


        return result.Match(
            response => Results.Ok(response),
            error => error.ToProblem());
    }
}