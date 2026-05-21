using MazadZone.Application.Features.Orders.Queries.GetGlobalStats;
using MazadZone.Application.Features.Orders.Queries.DTOs;

namespace MazadZone.Api.Endpoints.Orders;

public static class GetGlobalStats
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/stats/global", HandleAsync)
           .WithTags("Order Management")
           .WithName("GetGlobalStats")
           .Produces<AdminGlobalStatsDto>(StatusCodes.Status200OK)
           .RequireAuthorization("AdminOnly");
    }

    private static async Task<IResult> HandleAsync(
        [FromServices]ISender sender,
        CancellationToken ct)
    {
        var result = await sender.Send(new GetGlobalStatsQuery(), ct);
        return Results.Ok(result);
    }
}