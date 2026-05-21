using MazadZone.Application.Features.Categories.Queries;
using MazadZone.Application.Features.Categories.Queries.GetBreadcrumbs;
using MazadZone.Domain.Categories;

namespace MazadZone.Api.Endpoints.Categories;

public static class GetBreadcrumbs
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/{id}/breadcrumbs", HandleAsync)
           .WithTags("Category Queries")
           .WithSummary("Retrieves the hierarchical path (breadcrumbs) for a category")
           .Produces<IReadOnlyList<BreadcrumbResponse>>(StatusCodes.Status200OK)
           .Produces(StatusCodes.Status400BadRequest)
           .Produces(StatusCodes.Status404NotFound)
           .Produces(StatusCodes.Status500InternalServerError);
    }

    private static async Task<IResult> HandleAsync(
        [FromRoute] CategoryId id,
        [FromServices] ISender sender,
        CancellationToken ct)
    {
        // Using CategoryId directly; custom binding is assumed to be in place
        var query = new GetCategoryBreadcrumbsQuery(id);

        var result = await sender.Send(query, ct);

        return result.Match(
            onValue: breadcrumbs => Results.Ok(breadcrumbs),
            onError: error => error.ToProblem()
        );
    }
}