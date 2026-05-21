using MazadZone.Domain.Orders;

namespace MazadZone.Application.Features.Orders.Commands.ReplyToFeedback;

public static class ReplyToFeedback
{
    public record ReplyToFeedbackRequest(string ReplyText);

    public static void MapEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/orders/{orderId:guid}/feedback/reply", HandleAsync)
            .WithName("ReplyToOrderFeedback")
            .WithTags("Order Management")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .WithOpenApi();
    }

private static async Task<IResult> HandleAsync(
        [FromRoute] OrderId orderId,
        [FromBody] ReplyToFeedbackRequest request,
        [FromServices] ISender mediator,
        CancellationToken ct)
    {
        var command = new ReplyToFeedbackCommand(orderId, request.ReplyText);
        
        var result = await mediator.Send(command, ct);

        return result.Match(
            onValue: value => Results.NoContent(),
            onError: errors => errors.ToProblem());
    }
}