using MazadZone.Application.Features.Categories.Queries;
using MazadZone.Application.Features.Categories.Queries.GetRootCategories;

namespace MazadZone.Api.Endpoints.Categories;

public static class GetRoots
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/roots", HandleAsync)
           .WithTags("Category Queries")
           .WithSummary("Retrieves all top-level (root) categories")
           .Produces<IReadOnlyList<CategoryResponse>>(StatusCodes.Status200OK)
           .Produces(StatusCodes.Status400BadRequest)
           .Produces(StatusCodes.Status500InternalServerError);
    }

    private static async Task<IResult> HandleAsync(
        [FromServices] ISender sender,
        CancellationToken ct)
    {
        var query = new GetRootCategoriesQuery();

        var result = await sender.Send(query, ct);

        return result.Match(
            onValue: categories => Results.Ok(categories),
            onError: error => error.ToProblem()
        );
    }
}