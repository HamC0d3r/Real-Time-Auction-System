using MazadZone.Application.Features.Categories.Commands.MoveToParent;
using MazadZone.Domain.Categories;

namespace MazadZone.Api.Endpoints.Categories;

// Request contract is needed here to capture the new parent from the request body
public record MoveToParentRequest(CategoryId? NewParentId);

public static class MoveToParent
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPatch("/{id}/move", HandleAsync)
           .WithTags("Category Commands")
           .WithSummary("Moves a category to a different parent")
           .Produces(StatusCodes.Status204NoContent)
           .Produces(StatusCodes.Status400BadRequest)
           .Produces(StatusCodes.Status404NotFound)
           .Produces(StatusCodes.Status409Conflict) // For circular references or domain rule violations
           .Produces(StatusCodes.Status500InternalServerError);
    }

    private static async Task<IResult> HandleAsync(
        [FromRoute] CategoryId id,
        [FromBody] MoveToParentRequest request,
        [FromServices] ISender sender,
        CancellationToken ct)
    {
        // Using CategoryId directly as requested
        var command = new MoveToParentCommand(id, request.NewParentId);

        var result = await sender.Send(command, ct);

        return result.Match(
            onValue: _ => Results.NoContent(),
            onError: error => error.ToProblem()
        );
    }
}