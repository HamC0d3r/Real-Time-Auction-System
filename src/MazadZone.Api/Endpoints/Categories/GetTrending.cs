using MazadZone.Application.Features.Categories.Queries;
using MazadZone.Application.Features.Categories.Queries.GetTrendingCategories;

namespace MazadZone.Api.Endpoints.Categories;

internal sealed record GetTrendingRequest(int Limit = 10);

public static class GetTrending
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/trending", HandleAsync)
           .WithTags("Category Queries")
           .WithSummary("Retrieves categories with the highest activity")
           .Produces<IReadOnlyList<TrendingCategoryResponse>>(StatusCodes.Status200OK)
           .Produces(StatusCodes.Status400BadRequest)
           .Produces(StatusCodes.Status500InternalServerError);
    }

    private static async Task<IResult> HandleAsync(
        [FromBody]GetTrendingRequest request,
        [FromServices] ISender sender,
        CancellationToken ct)

    {
        var query = new GetTrendingCategoriesQuery(request.Limit);

        var result = await sender.Send(query, ct);

        return result.Match(
            onValue: trending => Results.Ok(trending),
            onError: error => error.ToProblem()
        );
    }
}