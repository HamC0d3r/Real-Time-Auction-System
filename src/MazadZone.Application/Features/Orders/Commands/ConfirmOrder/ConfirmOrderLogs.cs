using Microsoft.Extensions.Logging;
using MazadZone.Domain.Entities.Orders;
using MazadZone.Domain.Orders;

namespace MazadZone.Application.Features.Orders.Commands.ConfirmOrder;

internal static partial class ConfirmOrderLogs
{
    // Confirm Order Events (IDs 30 - 39)
    [LoggerMessage(EventId = 30, Level = LogLevel.Information, Message = "Attempting to confirm order with ID: {OrderId}")]
    public static partial void LogConfirmOrderAttempt(this ILogger logger, OrderId orderId);

    [LoggerMessage(EventId = 31, Level = LogLevel.Warning, Message = "Domain logic prevented confirmation for Order {OrderId}. Reason: {Reason}")]
    public static partial void LogConfirmOrderFailed(this ILogger logger, OrderId orderId, string reason);

    [LoggerMessage(EventId = 32, Level = LogLevel.Information, Message = "Order {OrderId} successfully confirmed and persisted.")]
    public static partial void LogOrderConfirmedSuccessfully(this ILogger logger, OrderId orderId);
}