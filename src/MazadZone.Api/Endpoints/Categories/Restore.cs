using MazadZone.Application.Features.Categories.Commands.Restore;
using MazadZone.Domain.Categories;

namespace MazadZone.Api.Endpoints.Categories;

public static class Restore
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/{id}/restore", HandleAsync)
           .WithTags("Category Commands")
           .WithSummary("Restores a soft-deleted category")
           .Produces(StatusCodes.Status204NoContent)
           .Produces(StatusCodes.Status400BadRequest)
           .Produces(StatusCodes.Status404NotFound)
           .Produces(StatusCodes.Status500InternalServerError);
    }

    private static async Task<IResult> HandleAsync(
        [FromRoute] CategoryId id,
        [FromServices] ISender sender,
        CancellationToken ct)
    {
        // Using CategoryId directly; assuming your custom binder is ready.
        var command = new RestoreCategoryCommand(id);

        var result = await sender.Send(command, ct);

        return result.Match(
            onValue: _ => Results.NoContent(),
            onError: error => error.ToProblem()
        );
    }
}