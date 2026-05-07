using MazadZone.Application.Features.Orders.Queries.GetOrderByWinningBid;
using MazadZone.Application.Features.Orders.Queries.DTOs;
using MazadZone.Domain.Auctions;
using MediatR;

namespace MazadZone.Api.Endpoints.Orders;

public static class GetByWinningBid
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/by-bid/{bidId:guid}", GetOrderByWinningBidAsync)
           .WithTags("Order Queries")
           .WithName("GetOrderByWinningBid")
           .Produces<OrderDetailsDto>(StatusCodes.Status200OK)
           .Produces(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> GetOrderByWinningBidAsync(
        BidId bidId,
        ISender sender,
        CancellationToken ct)
    {
        var result = await sender.Send(new GetOrderByWinningBidQuery(bidId), ct);
        return result.Match(onValue: value => Results.Ok(value), onError: e => e.ToProblem());
    }
}