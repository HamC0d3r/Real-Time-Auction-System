using MazadZone.Application.Features.Categories.Commands.AddSubCategory;
using MazadZone.Domain.Categories;

namespace MazadZone.Api.Endpoints.Categories;

public static class AddSubCategory
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/{parentId:guid}/sub-categories/{subCategoryId:guid}", HandleAsync)
           .WithTags("Category Commands")
           .WithSummary("Links a sub-category to a parent category")
           .Produces(StatusCodes.Status204NoContent)
           .Produces(StatusCodes.Status400BadRequest)
           .Produces(StatusCodes.Status404NotFound)
           .Produces(StatusCodes.Status409Conflict) // Added for domain rule violations
           .Produces(StatusCodes.Status500InternalServerError);
    }

    private static async Task<IResult> HandleAsync(
        [FromRoute]CategoryId parentId,
        [FromRoute]CategoryId subCategoryId,
        [FromServices] ISender sender,
        CancellationToken ct)
    {
        var command = new AddSubCategoryCommand(parentId, subCategoryId);

        var result = await sender.Send(command, ct);

        return result.Match(
            onValue: _ => Results.NoContent(),
            onError: error => error.ToProblem() 
        );
    }
}