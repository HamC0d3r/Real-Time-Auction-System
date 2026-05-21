using MazadZone.Application.Features.Orders.Commands.ShipOrder;
using MazadZone.Domain.Orders;

namespace MazadZone.Api.Endpoints.Orders;

public static class Ship
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/{id:guid}/ship", HandleAsync)
           .WithTags("Order Management")
           .WithSummary("Ships an Order")
           .Produces(StatusCodes.Status204NoContent)
           .Produces(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> HandleAsync(
        [FromRoute]OrderId id,
        [FromServices] ISender sender,
        CancellationToken ct)
    {
        var result = await sender.Send(new ShipOrderCommand(id), ct);
        return result.Match(onValue: _ => Results.NoContent(), onError: e => e.ToProblem());
    }
}