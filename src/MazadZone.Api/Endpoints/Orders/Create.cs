using MazadZone.Application.Features.Bidders.DTOs;
using MazadZone.Domain.Auctions;
using AutoMapper;
using MazadZone.Application.Features.Orders.Commands.Create;
using MazadZone.Domain.Shared.ValueObjects;

namespace MazadZone.Api.Endpoints.Orders;

public record CreateOrderRequest(
    AuctionId AuctionId,
    BidderId BidderId,
    BidId WinningBidId,
    AddressDto ReceiptAddress,
    decimal Amount,
    string DepositCaptureTransactionId)
{
    public CreateOrderCommand ToCommand(IMapper mapper) => new(
        AuctionId,
        BidderId,
        WinningBidId,
        mapper.Map<Address>(ReceiptAddress),
        Amount,
        DepositCaptureTransactionId);
}

public static class Create
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/", CreateOrderAsync)
           .WithTags("Order Commands")
           .WithSummary("Creates a new Order")
           .WithDescription("Initiates a post-auction order transaction.")
           .Produces<Guid>(StatusCodes.Status201Created)
           .Produces(StatusCodes.Status400BadRequest);
    }

    private static async Task<IResult> CreateOrderAsync(
        [FromBody] CreateOrderRequest? request,
        [FromServices] ISender sender,
        [FromServices] IMapper mapper,
        CancellationToken ct)
    {
        if (request is null) return Results.BadRequest("Request body cannot be null.");

        var result = await sender.Send(request.ToCommand(mapper), ct);

        return result.Match(
            onValue: orderId => Results.Created($"/api/orders/{orderId}", new { OrderId = orderId }),
            onError: e => e.ToProblem());
    }
}