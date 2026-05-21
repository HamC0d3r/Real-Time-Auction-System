using MazadZone.Application.Features.Categories.Queries;
using MazadZone.Application.Features.Categories.Queries.GetCategoryStatistics;

namespace MazadZone.Api.Endpoints.Categories;

public static class GetStatistics
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/statistics", HandleAsync)
           .WithTags("Category Queries")
           .WithSummary("Retrieves analytical statistics for all categories")
           .Produces<IReadOnlyList<CategoryStatResponse>>(StatusCodes.Status200OK)
           .Produces(StatusCodes.Status400BadRequest)
           .Produces(StatusCodes.Status500InternalServerError);
    }

    private static async Task<IResult> HandleAsync(
        [FromServices] ISender sender,
        CancellationToken ct)
    {
        var query = new GetCategoryStatisticsQuery();

        var result = await sender.Send(query, ct);

        return result.Match(
            onValue: stats => Results.Ok(stats),
            onError: error => error.ToProblem()
        );
    }
}