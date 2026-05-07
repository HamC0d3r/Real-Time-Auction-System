using MazadZone.Application.Features.Orders.Queries.GetOrderDetails;
using MazadZone.Application.Features.Orders.Queries.DTOs;
using MazadZone.Domain.Orders;

namespace MazadZone.Api.Endpoints.Orders;

public static class GetDetails
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/{id:guid}", GetOrderDetailsAsync)
           .WithTags("Order Queries")
           .WithName("GetOrderDetails")
           .Produces<OrderDetailsDto>(StatusCodes.Status200OK)
           .Produces(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> GetOrderDetailsAsync(
        OrderId id,
        ISender sender,
        CancellationToken ct)
    {
        var result = await sender.Send(new GetOrderDetailsQuery(id), ct);

        return result.Match(
           onValue: value => Results.Ok(value),
           onError: e => e.ToProblem());
    }
}