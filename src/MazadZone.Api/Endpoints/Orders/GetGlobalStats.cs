using MazadZone.Application.Features.Orders.Queries.GetGlobalStats;
using MazadZone.Application.Features.Orders.Queries.DTOs;

namespace MazadZone.Api.Endpoints.Orders;

public static class GetGlobalStats
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/stats/global", GetGlobalStatsAsync)
           .WithTags("Order Queries")
           .WithName("GetGlobalStats")
           .Produces<AdminGlobalStatsDto>(StatusCodes.Status200OK)
           .RequireAuthorization("AdminOnly");
    }

    private static async Task<IResult> GetGlobalStatsAsync(
        ISender sender,
        CancellationToken ct)
    {
        var result = await sender.Send(new GetGlobalStatsQuery(), ct);
        return Results.Ok(result);
    }
}