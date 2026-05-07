using MazadZone.Application.Features.Orders.Commands.OpenDispute;
using MazadZone.Domain.Orders;

namespace MazadZone.Api.Endpoints.Orders;

public record OpenDisputeRequest(string Reason)
{
    public OpenDisputeCommand ToCommand(OrderId orderId) => new(orderId, Reason);
}

public static class OpenDispute
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/{id:guid}/dispute", OpenDisputeAsync)
           .WithTags("Order Commands")
           .WithSummary("Opens a Dispute")
           .Produces(StatusCodes.Status204NoContent)
           .Produces(StatusCodes.Status400BadRequest);
    }

    private static async Task<IResult> OpenDisputeAsync(
        OrderId id,
        [FromBody] OpenDisputeRequest? request,
        [FromServices] ISender sender,
        CancellationToken ct)
    {
        if (request is null) return Results.BadRequest("Request body cannot be null.");

        var result = await sender.Send(request.ToCommand(id), ct);

        return result.Match(
            onValue: _ => Results.NoContent(),
            onError: errors => errors.ToProblem());
    }
}