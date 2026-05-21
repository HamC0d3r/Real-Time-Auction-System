using MazadZone.Application.Features.Categories.Queries;
using MazadZone.Application.Features.Categories.Queries.GetSubCategories;
using MazadZone.Domain.Categories;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace MazadZone.Api.Endpoints.Categories;

public static class GetSub
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/{id}/sub-categories", HandleAsync)
           .WithTags("Category Queries")
           .WithSummary("Retrieves all direct sub-categories for a given parent")
           .Produces<IReadOnlyList<CategoryResponse>>(StatusCodes.Status200OK)
           .Produces(StatusCodes.Status400BadRequest)
           .Produces(StatusCodes.Status404NotFound)
           .Produces(StatusCodes.Status500InternalServerError);
    }

    private static async Task<IResult> HandleAsync(
        [FromRoute] CategoryId id,
        [FromServices] ISender sender,
        CancellationToken ct)
    {
        // Using CategoryId directly; binding logic is handled by your infrastructure
        var query = new GetSubCategoriesQuery(id);

        var result = await sender.Send(query, ct);

        return result.Match(
            onValue: subCategories => Results.Ok(subCategories),
            onError: error => error.ToProblem()
        );
    }
}