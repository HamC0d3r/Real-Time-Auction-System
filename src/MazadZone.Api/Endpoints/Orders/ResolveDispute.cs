using MazadZone.Application.Features.Orders.Commands.ResolveDispute;
using MazadZone.Domain.Orders;

namespace MazadZone.Api.Endpoints.Orders;

public record ResolveDisputeRequest(string Resolution)
{
    public ResolveDisputeCommand ToCommand(OrderId orderId) => new(orderId, Resolution);
}

public static class ResolveDispute
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/{id:guid}/dispute/resolve", ResolveDisputeAsync)
           .WithTags("Order Commands")
           .WithSummary("Resolves an open Dispute")
           .Produces(StatusCodes.Status204NoContent)
           .Produces(StatusCodes.Status400BadRequest);
    }

    private static async Task<IResult> ResolveDisputeAsync(
        OrderId id,
        [FromBody] ResolveDisputeRequest? request,
        [FromServices] ISender sender,
        CancellationToken ct)
    {
        if (request is null) return Results.BadRequest("Request body cannot be null.");

        var result = await sender.Send(request.ToCommand(id), ct);
        return result.Match(onValue: _ => Results.NoContent(), onError: e => e.ToProblem());
    }
}