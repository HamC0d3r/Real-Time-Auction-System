using MazadZone.Application.Features.Orders.Queries.SearchOrders;
using MazadZone.Application.Features.Orders.Queries.DTOs;
using MazadZone.Application.Common.Paging;

namespace MazadZone.Api.Endpoints.Orders;

public static class Search
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/search", HandleAsync)
           .WithTags("Order Management")
           .WithName("SearchOrders")
           .Produces<PagedList<OrderSummaryDto>>(StatusCodes.Status200OK);
    }

    private static async Task<IResult> HandleAsync(
        [AsParameters] OrderSearchFilter filter,
        [FromServices]ISender sender,
        CancellationToken ct)
    {
        var result = await sender.Send(new SearchOrdersQuery(filter), ct);
        return Results.Ok(result);
    }
}