using MazadZone.Application.Features.Orders.Queries.SearchOrders;
using MazadZone.Application.Features.Orders.Queries.DTOs;
using MazadZone.Application.Common.Paging;

namespace MazadZone.Api.Endpoints.Orders;

public static class Search
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/search", SearchOrdersAsync)
           .WithTags("Order Queries")
           .WithName("SearchOrders")
           .Produces<PagedList<OrderSummaryDto>>(StatusCodes.Status200OK);
    }

    private static async Task<IResult> SearchOrdersAsync(
        [FromBody] OrderSearchFilter filter,
        ISender sender,
        CancellationToken ct)
    {
        var result = await sender.Send(new SearchOrdersQuery(filter), ct);
        return Results.Ok(result);
    }
}