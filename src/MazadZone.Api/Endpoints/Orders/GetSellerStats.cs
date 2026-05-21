using MazadZone.Application.Features.Orders.Queries.GetSellerStats;
using MazadZone.Application.Features.Orders.Queries.DTOs;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Sellers;

namespace MazadZone.Api.Endpoints.Orders;

public static class GetSellerStats
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/stats/seller/{sellerId:guid}", HandleAsync)
           .WithTags("Order Management")
           .WithName("GetSellerStats")
           .Produces<SellerOrderStatsDto>(StatusCodes.Status200OK);
    }

    private static async Task<IResult> HandleAsync(
        [FromRoute]SellerId sellerId,
        [FromServices]ISender sender,
        CancellationToken ct)
    {
        var result = await sender.Send(new GetSellerStatsQuery(sellerId), ct);
        return Results.Ok(result);
    }
}