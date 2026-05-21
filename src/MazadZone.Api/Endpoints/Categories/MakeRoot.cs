using MazadZone.Application.Features.Categories.Commands.MakeRootCategory;
using MazadZone.Domain.Categories;

namespace MazadZone.Api.Endpoints.Categories;
public static class MakeRoot
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPatch("/{id:guid}/make-root", HandleAsync)
           .WithTags("Category Commands")
           .WithSummary("Promotes a sub-category to a root-level category")
           .Produces(StatusCodes.Status204NoContent)
           .Produces(StatusCodes.Status400BadRequest)
           .Produces(StatusCodes.Status404NotFound)
           .Produces(StatusCodes.Status500InternalServerError);
    }

    private static async Task<IResult> HandleAsync(
        [FromRoute]CategoryId id,
        [FromServices] ISender sender,
        CancellationToken ct)
    {
        // Mapping the route GUID to the Domain Value Object
        var command = new MakeRootCategoryCommand(id);

        var result = await sender.Send(command, ct);

        return result.Match(
            onValue: _ => Results.NoContent(),
            onError: error => error.ToProblem()
        );
    }
}