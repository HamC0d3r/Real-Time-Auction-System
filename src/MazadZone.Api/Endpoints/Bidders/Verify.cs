using MazadZone.Domain.Bidders;
using MazadZone.Application.Features.Bidders.Commands.Verify;

namespace MazadZone.Api.Endpoints.Bidders;

public static class Verify
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/{id:guid}", HandleAsync)
           .WithSummary("Verifies a Bidder")
           .WithDescription("Verifies the identity of a specific bidder.")
           .Produces(StatusCodes.Status204NoContent)
           .Produces(StatusCodes.Status400BadRequest)
           .Produces(StatusCodes.Status404NotFound)
           .Produces(StatusCodes.Status500InternalServerError);
    }

    private static async Task<IResult> HandleAsync(
        [FromRoute] BidderId id,
        [FromServices] ISender sender,
        CancellationToken ct)
    {
        var query = new VerifyBidderCommand(id);
        var result = await sender.Send(query, ct);

        return result.Match(
            onValue: _ => Results.NoContent(),
            onError: errors => errors.ToProblem());
    }
}