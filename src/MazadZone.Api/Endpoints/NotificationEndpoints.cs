using Microsoft.AspNetCore.Mvc;
using MediatR;
using AutoMapper;
using MazadZone.Application.Features.Notifications.Commands.CreateNotification;
using MazadZone.Application.Features.Notifications.Commands.MarkAsRead;
using MazadZone.Application.Features.Notifications.Commands.DeleteNotification;
using MazadZone.Application.Features.Notifications.Queries.GetNotifications;
using MazadZone.Application.Features.Notifications.Queries.GetNotificationById;
using MazadZone.Application.Features.Notifications.Queries.DTOs;
using MazadZone.Api.Contracts.Notifications;
using MazadZone.Domain.Notifications;

namespace MazadZone.Api.Endpoints;

public static class NotificationEndpoints
{
    public static void MapNotificationEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/notifications", CreateNotificationAsync)
            .WithTags("Notifications")
            .WithSummary("Creates a new Notification")
            .WithDescription("Creates a new notification for a user with title and message.")
            .Produces<Guid>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status500InternalServerError);

        app.MapGet("/api/notifications", GetNotificationsAsync)
            .WithTags("Notifications")
            .WithSummary("Gets User Notifications")
            .WithDescription("Retrieves paginated notifications for a specific user.")
            .Produces<NotificationsListDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status500InternalServerError);

        app.MapGet("/api/notifications/{id:guid}", GetNotificationByIdAsync)
            .WithTags("Notifications")
            .WithSummary("Gets Notification by ID")
            .WithDescription("Retrieves the details of a specific notification by its unique identifier.")
            .Produces<NotificationDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status500InternalServerError);

        app.MapPost("/api/notifications/{id:guid}/mark-as-read", MarkAsReadAsync)
            .WithTags("Notifications")
            .WithSummary("Marks Notification as Read")
            .WithDescription("Marks a notification as read by updating its IsRead status.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status500InternalServerError);

        app.MapDelete("/api/notifications/{id:guid}", DeleteNotificationAsync)
            .WithTags("Notifications")
            .WithSummary("Deletes a Notification")
            .WithDescription("Soft deletes a notification by marking it as deleted.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status500InternalServerError);
    }

    /// <summary>
    /// Creates a new notification for a user.
    /// </summary>
    /// <param name="request">The incoming notification request body.</param>
    /// <param name="sender">The MediatR ISender for dispatching commands.</param>
    /// <param name="mapper">The AutoMapper instance for domain mapping.</param>
    /// <param name="cancellationToken">Propagates notification that operations should be canceled.</param>
    /// <returns>Returns 201 Created with the Notification ID, 400 Bad Request if invalid, or 500 on server error.</returns>
    private static async Task<IResult> CreateNotificationAsync(
        [FromBody] CreateNotificationRequest? request,
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
            var command = mapper.Map<CreateNotificationCommand>(request);

            var result = await sender.Send(command, cancellationToken);

            if (result.IsFailure)
            {
                return Results.BadRequest(result.TopError);
            }

            return Results.Created($"/api/notifications/{result.Value.Value}", result.Value.Value);
        }
        catch (Exception)
        {
            return Results.Problem("An unexpected error occurred processing the notification.", statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    /// <summary>
    /// Retrieves paginated notifications for a specific user.
    /// </summary>
    /// <param name="request">The query parameters for notifications.</param>
    /// <param name="sender">The MediatR ISender for dispatching queries.</param>
    /// <param name="mapper">The AutoMapper instance for domain mapping.</param>
    /// <param name="cancellationToken">Propagates notification that operations should be canceled.</param>
    /// <returns>Returns 200 OK with the list of notifications, 400 Bad Request if invalid, or 500 on server error.</returns>
    private static async Task<IResult> GetNotificationsAsync(
        [AsParameters] GetNotificationsRequest request,
        [FromServices] ISender sender,
        [FromServices] IMapper mapper,
        CancellationToken cancellationToken)
    {
        if (request is null || request.PageNumber < 1 || request.PageSize < 1)
        {
            return Results.BadRequest("Invalid pagination parameters.");
        }

        try
        {
            var query = mapper.Map<GetNotificationsQuery>(request);

            var result = await sender.Send(query, cancellationToken);

            if (result.IsFailure)
            {
                return Results.BadRequest(result.TopError);
            }

            return Results.Ok(result.Value);
        }
        catch (Exception)
        {
            return Results.Problem("An unexpected error occurred retrieving notifications.", statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    /// <summary>
    /// Retrieves a specific notification by its ID.
    /// </summary>
    /// <param name="id">The notification ID.</param>
    /// <param name="sender">The MediatR ISender for dispatching queries.</param>
    /// <param name="cancellationToken">Propagates notification that operations should be canceled.</param>
    /// <returns>Returns 200 OK with notification details, 404 Not Found if not found, or 500 on server error.</returns>
    private static async Task<IResult> GetNotificationByIdAsync(
        Guid id,
        [FromServices] ISender sender,
        CancellationToken cancellationToken)
    {
        if (id == Guid.Empty)
        {
            return Results.BadRequest("Invalid notification ID.");
        }

        try
        {
            var notificationId = new NotificationId(id);

            // Create a query to fetch the notification by ID
            // Note: GetNotificationByIdQuery needs to be created in the application layer
            var query = new GetNotificationByIdQuery(notificationId);

            var result = await sender.Send(query, cancellationToken);

            if (result.IsFailure)
            {
                if (result.TopError.Code == "Notification.NotFound")
                    return Results.NotFound(new { Error = result.TopError });

                return Results.BadRequest(new { Error = result.TopError });
            }

            return Results.Ok(result.Value);
        }
        catch (Exception)
        {
            return Results.Problem("An unexpected error occurred retrieving the notification.", statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    /// <summary>
    /// Marks a notification as read.
    /// </summary>
    /// <param name="id">The notification ID.</param>
    /// <param name="sender">The MediatR ISender for dispatching commands.</param>
    /// <param name="cancellationToken">Propagates notification that operations should be canceled.</param>
    /// <returns>Returns 204 No Content on success, 404 Not Found if not found, or 500 on server error.</returns>
    private static async Task<IResult> MarkAsReadAsync(
        Guid id,
        [FromServices] ISender sender,
        CancellationToken cancellationToken)
    {
        if (id == Guid.Empty)
        {
            return Results.BadRequest("Invalid notification ID.");
        }

        try
        {
            var notificationId = new NotificationId(id);
            var command = new MarkAsReadCommand(notificationId);

            var result = await sender.Send(command, cancellationToken);

            if (result.IsFailure)
            {
                if (result.TopError.Code == "Notification.NotFound")
                    return Results.NotFound(new { Error = result.TopError });

                return Results.BadRequest(new { Error = result.TopError });
            }

            return Results.NoContent();
        }
        catch (Exception)
        {
            return Results.Problem("An unexpected error occurred marking the notification as read.", statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    /// <summary>
    /// Deletes (soft delete) a notification.
    /// </summary>
    /// <param name="id">The notification ID.</param>
    /// <param name="sender">The MediatR ISender for dispatching commands.</param>
    /// <param name="cancellationToken">Propagates notification that operations should be canceled.</param>
    /// <returns>Returns 204 No Content on success, 404 Not Found if not found, or 500 on server error.</returns>
    private static async Task<IResult> DeleteNotificationAsync(
        Guid id,
        [FromServices] ISender sender,
        CancellationToken cancellationToken)
    {
        if (id == Guid.Empty)
        {
            return Results.BadRequest("Invalid notification ID.");
        }

        try
        {
            var notificationId = new NotificationId(id);
            var command = new DeleteNotificationCommand(notificationId);

            var result = await sender.Send(command, cancellationToken);

            if (result.IsFailure)
            {
                if (result.TopError.Code == "Notification.NotFound")
                    return Results.NotFound(new { Error = result.TopError });

                return Results.BadRequest(new { Error = result.TopError });
            }

            return Results.NoContent();
        }
        catch (Exception)
        {
            return Results.Problem("An unexpected error occurred deleting the notification.", statusCode: StatusCodes.Status500InternalServerError);
        }
    }
}