using MazadZone.Application.Features.Categories.Queries;
using MazadZone.Application.Features.Categories.Queries.GetById;
using MazadZone.Domain.Categories;

namespace MazadZone.Api.Endpoints.Categories;

public static class GetById
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/{id}", HandleAsync)
           .WithTags("Category Queries")
           .WithSummary("Gets a category by its unique ID")
           .Produces<CategoryResponse>(StatusCodes.Status200OK)
           .Produces(StatusCodes.Status400BadRequest)    // Mapping/Binding errors
           .Produces(StatusCodes.Status404NotFound)   // Category not found
           .Produces(StatusCodes.Status500InternalServerError);
    }

    private static async Task<IResult> HandleAsync(
        [FromRoute] CategoryId id,
        [FromServices] ISender sender,
        CancellationToken ct)
    {
        // Using the domain ID directly as requested
        var query = new GetCategoryByIdQuery(id);

        var result = await sender.Send(query, ct);

        return result.Match(
            onValue: category => Results.Ok(category),
            onError: error => error.ToProblem()
        );
    }
}