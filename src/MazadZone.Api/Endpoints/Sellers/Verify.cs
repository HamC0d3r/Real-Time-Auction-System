using MazadZone.Application.Features.Sellers.Commands.Verify;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Sellers;

namespace MazadZone.Api.Endpoints.Sellers;

public static class Verify
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("{id:guid}/verify", HandleAsync)
           .WithSummary("Verifies a seller")
           .Produces(StatusCodes.Status204NoContent)
           .Produces(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> HandleAsync(
        [FromRoute]SellerId id,
        [FromServices] ISender sender,
        CancellationToken ct)
    {
        var result = await sender.Send(new VerifyCommand(id), ct);
        return result.Match(_ => Results.NoContent(), e => e.ToProblem());
    }
}