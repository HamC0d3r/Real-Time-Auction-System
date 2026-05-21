using MazadZone.Application.Features.Categories.Commands.Update;
using MazadZone.Domain.Categories;

namespace MazadZone.Api.Endpoints.Categories;

public record UpdateCategoryRequest(string Name, string Description);

public static class Update
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("/{id}", HandleAsync)
           .WithTags("Category Commands")
           .WithSummary("Updates category details")
           .Produces(StatusCodes.Status204NoContent)
           .Produces(StatusCodes.Status400BadRequest)     // For value object validation failures
           .Produces(StatusCodes.Status404NotFound)       // If the CategoryId doesn't exist
           .Produces(StatusCodes.Status409Conflict)       // For domain rule violations or concurrency
           .Produces(StatusCodes.Status500InternalServerError);
    }

    private static async Task<IResult> HandleAsync(
        [FromRoute] CategoryId id,
        [FromBody] UpdateCategoryRequest request,
        [FromServices] ISender sender,
        CancellationToken ct)
    {
        // Mapping the Request + Route ID to the Application Command
        var command = new UpdateCategoryCommand(
            id, 
            request.Name, 
            request.Description);

        var result = await sender.Send(command, ct);

        return result.Match(
            onValue: _ => Results.NoContent(),
            onError: error => error.ToProblem()
        );
    }
}