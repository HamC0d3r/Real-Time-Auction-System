using MazadZone.Application.Common.Paging;
using MazadZone.Application.Features.Users.DTOs;
using MazadZone.Application.Features.Users.Queries.GetUsers;

namespace MazadZone.Api.Endpoints.Users;

public static class GetUsers
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("", HandleAsync)
           .RequireAuthorization(Policies.AdminOnly) // Listing all users is typically an admin-only feature
           .WithSummary("Get paginated users list")
           .WithDescription("Retrieves a paginated, filtered, and sorted list of users.")
           .Produces<PagedList<UserDto>>(StatusCodes.Status200OK)
           .ProducesValidationProblem(StatusCodes.Status400BadRequest) // Invalid pagination/filters
           .ProducesProblem(StatusCodes.Status401Unauthorized)         // Missing or invalid token
           .ProducesProblem(StatusCodes.Status403Forbidden)            // User lacks admin privileges
           .ProducesProblem(StatusCodes.Status500InternalServerError);
    }

    private static async Task<IResult> HandleAsync(
        [AsParameters] UserFilterParams filterParams,
        [FromServices] ISender sender,
        CancellationToken ct)
    {
        var result = await sender.Send(new GetUsersQuery(filterParams), ct);

        return result.Match(
            response => Results.Ok(response),
            error => error.ToProblem());
    }
}