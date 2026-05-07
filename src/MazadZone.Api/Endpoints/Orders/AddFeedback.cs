using MazadZone.Application.Features.Orders.Commands.AddFeedback;
using MazadZone.Domain.Orders;

namespace MazadZone.Api.Endpoints.Orders;

public record AddFeedbackRequest(int Rating, string Comment)
{
    public AddFeedbackCommand ToCommand(OrderId orderId) => new(orderId, Rating, Comment);
}

public static class AddFeedback
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/{id:guid}/feedback", AddFeedbackAsync)
           .WithTags("Order Commands")
           .WithSummary("Adds Feedback to a Delivered Order")
           .Produces(StatusCodes.Status204NoContent)
           .Produces(StatusCodes.Status400BadRequest);
    }

    private static async Task<IResult> AddFeedbackAsync(
        OrderId id,
        [FromBody] AddFeedbackRequest? request,
        [FromServices] ISender sender,
        CancellationToken ct)
    {
        if (request is null) return Results.BadRequest("Request body cannot be null.");

        var result = await sender.Send(request.ToCommand(id), ct);
        return result.Match(onValue: _ => Results.NoContent(), onError: e => e.ToProblem());
    }
}