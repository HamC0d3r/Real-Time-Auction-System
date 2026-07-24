using MazadZone.Application.Features.Users.DTOs;
using MazadZone.Application.Features.Users.Queries.ExportUsers;

namespace MazadZone.Api.Endpoints.Users;

public static class ExportUsers
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/export", HandleAsync)
           .RequireAuthorization(Policies.AdminOnly) 
           .WithSummary("Export users to CSV")
           .WithDescription("Generates and downloads a CSV file of filtered users bypassing pagination limits.")
           .Produces(StatusCodes.Status200OK, contentType: "text/csv")
           .ProducesValidationProblem(StatusCodes.Status400BadRequest)
           .ProducesProblem(StatusCodes.Status415UnsupportedMediaType)
           .ProducesProblem(StatusCodes.Status500InternalServerError);
    }

    private static async Task<IResult> HandleAsync(
        [AsParameters] UserFilterParams filterParams,
        [FromServices] ISender sender,
        CancellationToken ct)
    {
        // Send the filter parameters directly into our dedicated export pipeline
        var result = await sender.Send(new ExportUsersQuery(filterParams), ct);

        return result.Match(
            fileResponse => Results.File(
                fileResponse.FileContents, 
                fileResponse.ContentType, 
                fileResponse.FileName),
            error => error.ToProblem());
    }
}