using MazadZone.Application.Features.Categories.Commands.Delete;
using MazadZone.Domain.Categories;

namespace MazadZone.Api.Endpoints.Categories;

// Isolated Request Contract for the API layer
// public record DeleteCategoryRequest(CategoryId Id);

public static class Delete
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete("/{id:guid}", HandleAsync)
           .WithTags("Category Commands")
           .WithSummary("Deletes a category and its subcategories")
           .WithDescription("Will fail with a Conflict if the category has active auctions.")
           .Produces(StatusCodes.Status204NoContent)
           .Produces(StatusCodes.Status400BadRequest)        // Malformed ID or validation
           .Produces(StatusCodes.Status404NotFound)       // Category does not exist
           .Produces(StatusCodes.Status409Conflict)       // Domain rule: e.g., Active Auctions exist
           .Produces(StatusCodes.Status500InternalServerError); 
    }

    private static async Task<IResult> HandleAsync(
        [FromRoute] CategoryId id,
        [FromServices] ISender sender,
        CancellationToken ct)
    {
        var command = new DeleteCategoryCommand(id);

        var result = await sender.Send(command, ct);

        return result.Match(
            onValue: _ => Results.NoContent(),
            onError: error => error.ToProblem() 
        );
    }
}