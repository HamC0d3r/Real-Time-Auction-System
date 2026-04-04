using Microsoft.AspNetCore.Mvc;
using MediatR;
using AutoMapper;
using MazadZone.Application.Orders.ConfirmOrder;
using MazadZone.Application.Orders.ShipOrder;
using MazadZone.Application.Orders.DeliverOrder;
using MazadZone.Application.Orders.OpenDispute;
using MazadZone.Application.Orders.ResolveDispute;
using MazadZone.Application.Orders.Queries.GetOrderDetails;
using MazadZone.Application.Orders.Queries.GetMyInventory;
using MazadZone.Application.Orders.Queries.DTOs;
using MazadZone.Application.Features.Orders.Commands.CreateOrder;
using MazadZone.Api.Contracts.Orders;
using MazadZone.Domain.Orders;
using MazadZone.Application.Features.Orders.Commands.AddFeedback;

namespace MazadZone.Api.Endpoints;

public static class OrderEndpoints
{
    public static void MapOrderEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/orders", CreateOrderAsync)
            .WithTags("Orders")
            .WithSummary("Creates a new Order")
            .WithDescription("Initiates a post-auction order transaction by creating a new Order instance mapping bidder, bid, address, and transaction data.")
            .Produces<Guid>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status500InternalServerError);

        app.MapPost("/api/orders/{id:guid}/confirm", ConfirmOrderAsync)
            .WithTags("Orders")
            .WithSummary("Confirms an Order")
            .WithDescription("Transitions the order status to Confirmed.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status500InternalServerError);

        app.MapPost("/api/orders/{id:guid}/ship", ShipOrderAsync)
            .WithTags("Orders")
            .WithSummary("Ships an Order")
            .WithDescription("Transitions the order status to Shipped.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status500InternalServerError);

        app.MapPost("/api/orders/{id:guid}/deliver", DeliverOrderAsync)
            .WithTags("Orders")
            .WithSummary("Delivers an Order")
            .WithDescription("Transitions the order status to Delivered.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status500InternalServerError);

        app.MapPost("/api/orders/{id:guid}/cancel", CancelOrderAsync)
            .WithTags("Orders")
            .WithSummary("Cancels an Order")
            .WithDescription("Transitions the order status to Cancelled.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status500InternalServerError);

        app.MapPost("/api/orders/{id:guid}/dispute", OpenDisputeAsync)
            .WithTags("Orders")
            .WithSummary("Opens a Dispute on an Order")
            .WithDescription("Initiates a dispute regarding an order that has been delivered or encounters issues.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status500InternalServerError);

        app.MapPost("/api/orders/{id:guid}/dispute/resolve", ResolveDisputeAsync)
            .WithTags("Orders")
            .WithSummary("Resolves an open Dispute")
            .WithDescription("Provides resolution details to close an active dispute.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status500InternalServerError);

        app.MapPost("/api/orders/{id:guid}/feedback", AddFeedbackAsync)
            .WithTags("Orders")
            .WithSummary("Adds Feedback to a Delivered Order")
            .WithDescription("Allows users to leave a rating and comment post-delivery.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status500InternalServerError);

        app.MapGet("/api/orders/{id:guid}", GetOrderDetailsAsync)
            .WithTags("Orders")
            .WithSummary("Gets Order Details")
            .WithDescription("Retrieves the full details of a specific order using a high-performance read model.")
            .Produces<OrderDetailsDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status500InternalServerError);

        app.MapGet("/api/orders/my-inventory", GetMyInventoryAsync)
            .WithTags("Orders")
            .WithSummary("Gets Seller Inventory and Analytics")
            .WithDescription("Retrieves analytical data including total sales, pending orders count, and paginated order history.")
            .Produces<MyInventoryDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status500InternalServerError);
    }

    /// <summary>
    /// Creates a new order from a successful bid auction.
    /// </summary>
    /// <param name="request">The incoming order request body.</param>
    /// <param name="sender">The MediatR ISender for dispatching commands.</param>
    /// <param name="mapper">The AutoMapper instance for domain mapping.</param>
    /// <param name="cancellationToken">Propagates notification that operations should be canceled.</param>
    /// <returns>Returns 201 Created with the Order ID, 400 Bad Request if invalid, or 500 on server error.</returns>
    private static async Task<IResult> CreateOrderAsync(
        [FromBody] CreateOrderRequest? request,
        [FromServices] ISender sender,
        [FromServices] IMapper mapper,
        CancellationToken cancellationToken)
    {
        if (request is null)
        {
            return Results.BadRequest("Request body cannot be null.");
        }

        try
        {
            var command = mapper.Map<CreateOrderCommand>(request);
            
            var result = await sender.Send(command, cancellationToken);

            if (result.IsFailure)
            {
                return Results.BadRequest(result.TopError);
            }

            return Results.Created($"/api/orders/{result.Value}", result.Value);
        }
        catch (Exception)
        {
            // In a production scenario, log the exception using ILogger here
            return Results.Problem("An unexpected error occurred processing the order.", statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    /// <summary>
    /// Confirms an existing order.
    /// </summary>
    private static async Task<IResult> ConfirmOrderAsync(
        Guid id,
        [FromServices] ISender sender,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await sender.Send(new ConfirmOrderCommand(id), cancellationToken);

            if (result.IsFailure)
            {
                if (result.TopError == OrderErrors.NotFound)
                    return Results.NotFound(new { Error = result.TopError });
                
                return Results.BadRequest(new { Error = result.TopError });
            }

            return Results.NoContent();
        }
        catch (Exception)
        {
            return Results.Problem("An unexpected error occurred while confirming the order.", statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    /// <summary>
    /// Marks an existing order as Shipped.
    /// </summary>
    private static async Task<IResult> ShipOrderAsync(
        Guid id,
        [FromServices] ISender sender,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await sender.Send(new ShipOrderCommand(id), cancellationToken);

            if (result.IsFailure)
            {
                if (result.Error == OrderErrors.NotFound)
                    return Results.NotFound(new { Error = result.Error });
                
                return Results.BadRequest(new { Error = result.Error });
            }

            return Results.NoContent();
        }
        catch (Exception)
        {
            return Results.Problem("An unexpected error occurred while shipping the order.", statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    /// <summary>
    /// Marks an existing order as Delivered.
    /// </summary>
    private static async Task<IResult> DeliverOrderAsync(
        Guid id,
        [FromServices] ISender sender,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await sender.Send(new DeliverOrderCommand(id), cancellationToken);

            if (result.IsFailure)
            {
                if (result.Error == OrderErrors.NotFound)
                    return Results.NotFound(new { Error = result.Error });
                
                return Results.BadRequest(new { Error = result.Error });
            }

            return Results.NoContent();
        }
        catch (Exception)
        {
            return Results.Problem("An unexpected error occurred while delivering the order.", statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    /// <summary>
    /// Cancels an existing order.
    /// </summary>
    private static async Task<IResult> CancelOrderAsync(
        Guid id,
        [FromServices] ISender sender,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await sender.Send(new CancelOrderCommand(id), cancellationToken);

            if (result.IsFailure)
            {
                if (result.Error == OrderErrors.NotFound)
                    return Results.NotFound(new { Error = result.Error });
                
                return Results.BadRequest(new { Error = result.Error });
            }

            return Results.NoContent();
        }
        catch (Exception)
        {
            return Results.Problem("An unexpected error occurred while canceling the order.", statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    /// <summary>
    /// Opens a dispute on an order.
    /// </summary>
    private static async Task<IResult> OpenDisputeAsync(
        Guid id,
        [FromBody] OpenDisputeRequest? request,
        [FromServices] ISender sender,
        CancellationToken cancellationToken)
    {
        if (request is null) return Results.BadRequest("Request body cannot be null.");

        try
        {
            var result = await sender.Send(new OpenDisputeCommand(id, request.Reason), cancellationToken);

            if (result.IsFailure)
            {
                if (result.Error == OrderErrors.NotFound)
                    return Results.NotFound(new { Error = result.Error });
                
                return Results.BadRequest(new { Error = result.Error });
            }

            return Results.NoContent();
        }
        catch (Exception)
        {
            return Results.Problem("An unexpected error occurred while opening the dispute.", statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    /// <summary>
    /// Resolves an open dispute on an order.
    /// </summary>
    private static async Task<IResult> ResolveDisputeAsync(
        Guid id,
        [FromBody] ResolveDisputeRequest? request,
        [FromServices] ISender sender,
        CancellationToken cancellationToken)
    {
        if (request is null) return Results.BadRequest("Request body cannot be null.");

        try
        {
            var result = await sender.Send(new ResolveDisputeCommand(id, request.Resolution), cancellationToken);

            if (result.IsFailure)
            {
                if (result.Error == OrderErrors.NotFound)
                    return Results.NotFound(new { Error = result.Error });
                
                return Results.BadRequest(new { Error = result.Error });
            }

            return Results.NoContent();
        }
        catch (Exception)
        {
            return Results.Problem("An unexpected error occurred while resolving the dispute.", statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    /// <summary>
    /// Adds feedback to a delivered order.
    /// </summary>
    private static async Task<IResult> AddFeedbackAsync(
        Guid id,
        [FromBody] AddFeedbackRequest? request,
        [FromServices] ISender sender,
        CancellationToken cancellationToken)
    {
        if (request is null) return Results.BadRequest("Request body cannot be null.");

        try
        {
            var result = await sender.Send(new AddFeedbackCommand(id, request.Rating, request.Comment), cancellationToken);

            if (result.IsFailure)
            {
                if (result.Error == OrderErrors.NotFound)
                    return Results.NotFound(new { Error = result.Error });
                
                return Results.BadRequest(new { Error = result.Error });
            }

            return Results.NoContent();
        }
        catch (Exception)
        {
            return Results.Problem("An unexpected error occurred while adding feedback.", statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    /// <summary>
    /// Retrieves the details of a specific order.
    /// </summary>
    private static async Task<IResult> GetOrderDetailsAsync(
        Guid id,
        [FromServices] ISender sender,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await sender.Send(new GetOrderDetailsQuery(id), cancellationToken);

            if (result.IsFailure)
            {
                if (result.Error == OrderErrors.NotFound)
                    return Results.NotFound(new { Error = result.Error });

                return Results.BadRequest(new { Error = result.Error });
            }

            return Results.Ok(result.Value);
        }
        catch (Exception)
        {
            return Results.Problem("An unexpected error occurred while retrieving order details.", statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    /// <summary>
    /// Retrieves inventory analytics for a user.
    /// </summary>
    private static async Task<IResult> GetMyInventoryAsync(
        [FromQuery] Guid userId,
        [FromQuery] int page,
        [FromQuery] int pageSize,
        [FromServices] ISender sender,
        CancellationToken cancellationToken)
    {
        try
        {
            page = page <= 0 ? 1 : page;
            pageSize = pageSize <= 0 ? 10 : pageSize;

            var result = await sender.Send(new GetMyInventoryQuery(userId, page, pageSize), cancellationToken);
            return Results.Ok(result.Value);
        }
        catch (Exception)
        {
            return Results.Problem("An unexpected error occurred while retrieving inventory.", statusCode: StatusCodes.Status500InternalServerError);
        }
    }
}