using MazadZone.Application.Features.Categories.Queries;
using MazadZone.Application.Features.Categories.Queries.SearchCategories;

namespace MazadZone.Api.Endpoints.Categories;

// Isolated Request record for query string binding
// Using [FromQuery] names specifically if you want to alias them, 
// otherwise it matches the property name (?searchTerm=...)
public record SearchCategoriesRequest(string SearchTerm);

public static class Search
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/search", HandleAsync)
           .WithTags("Category Queries")
           .WithSummary("Searches categories by name")
           .Produces<IReadOnlyList<CategoryResponse>>(StatusCodes.Status200OK)
           .Produces(StatusCodes.Status400BadRequest)
           .Produces(StatusCodes.Status500InternalServerError);
    }

    private static async Task<IResult> HandleAsync(
        [AsParameters] SearchCategoriesRequest request,
        [FromServices] ISender sender,
        CancellationToken ct)
    {
        // Full Isolation: Mapping the API Request to the Application Query
        var query = new SearchCategoriesQuery(request.SearchTerm);

        var result = await sender.Send(query, ct);

        return result.Match(
            onValue: results => Results.Ok(results),
            onError: error => error.ToProblem()
        );
    }
}