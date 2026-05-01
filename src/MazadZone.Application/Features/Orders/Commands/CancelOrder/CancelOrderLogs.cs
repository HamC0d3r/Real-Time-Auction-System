using Microsoft.Extensions.Logging;
using MazadZone.Domain.Orders;

namespace MazadZone.Application.Features.Orders.Commands.CancelOrder;

internal static partial class CancelOrderLogs
{
    // Cancel Order Events (IDs 20 - 29)
    [LoggerMessage(EventId = 20, Level = LogLevel.Information, Message = "Attempting to cancel order with ID: {OrderId}")]
    public static partial void LogCancelOrderAttempt(this ILogger logger, OrderId orderId);

    [LoggerMessage(EventId = 21, Level = LogLevel.Warning, Message = "Domain logic prevented cancellation for Order {OrderId}. Reason: {Reason}")]
    public static partial void LogCancelOrderFailed(this ILogger logger, OrderId orderId, string reason);

    [LoggerMessage(EventId = 22, Level = LogLevel.Information, Message = "Order {OrderId} successfully cancelled and persisted.")]
    public static partial void LogOrderCancelledSuccessfully(this ILogger logger, OrderId orderId);
}