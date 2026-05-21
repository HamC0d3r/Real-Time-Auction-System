using MazadZone.Application.Features.Categories.Queries;
using MazadZone.Application.Features.Categories.Queries.GetCategoryTree;

namespace MazadZone.Api.Endpoints.Categories;

public static class GetTree
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/tree", HandleAsync)
           .WithTags("Category Queries")
           .WithSummary("Retrieves the full hierarchical category tree")
           .Produces<IReadOnlyList<CategoryTreeResponse>>(StatusCodes.Status200OK)
           .Produces(StatusCodes.Status400BadRequest)
           .Produces(StatusCodes.Status500InternalServerError);
    }

    private static async Task<IResult> HandleAsync(
        [FromServices] ISender sender,
        CancellationToken ct)
    {
        var query = new GetCategoryTreeQuery();

        var result = await sender.Send(query, ct);

        return result.Match(
            onValue: tree => Results.Ok(tree),
            onError: error => error.ToProblem()
        );
    }
}