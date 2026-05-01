using Microsoft.Extensions.Logging;
using MazadZone.Domain.Entities.Orders;

namespace MazadZone.Application.Features.Orders.Commands.DeliverOrder;

internal static partial class DeliverOrderLogs
{
    // Deliver Order Events (IDs 50 - 59)
    [LoggerMessage(EventId = 50, Level = LogLevel.Information, Message = "Attempting to deliver order with ID: {OrderId}")]
    public static partial void LogDeliverOrderAttempt(this ILogger logger, OrderId orderId);

    [LoggerMessage(EventId = 51, Level = LogLevel.Warning, Message = "Domain logic prevented delivery for Order {OrderId}. Reason: {Reason}")]
    public static partial void LogDeliverOrderFailed(this ILogger logger, OrderId orderId, string reason);

    [LoggerMessage(EventId = 52, Level = LogLevel.Information, Message = "Order {OrderId} successfully delivered and persisted.")]
    public static partial void LogOrderDeliveredSuccessfully(this ILogger logger, OrderId orderId);
}