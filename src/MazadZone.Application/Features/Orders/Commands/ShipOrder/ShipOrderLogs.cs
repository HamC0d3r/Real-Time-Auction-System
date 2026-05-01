using Microsoft.Extensions.Logging;
using MazadZone.Domain.Entities.Orders;

namespace MazadZone.Application.Features.Orders.Commands.ShipOrder;

internal static partial class ShipOrderLogs
{
    // Ship Order Events (IDs 80 - 89)
    [LoggerMessage(EventId = 80, Level = LogLevel.Information, Message = "Attempting to ship order with ID: {OrderId}")]
    public static partial void LogShipOrderAttempt(this ILogger logger, OrderId orderId);

    [LoggerMessage(EventId = 81, Level = LogLevel.Warning, Message = "Domain logic prevented shipping for Order {OrderId}. Reason: {Error}")]
    public static partial void LogShipOrderFailed(this ILogger logger, OrderId orderId, string error);

    [LoggerMessage(EventId = 82, Level = LogLevel.Information, Message = "Order {OrderId} successfully shipped and persisted.")]
    public static partial void LogOrderShippedSuccessfully(this ILogger logger, OrderId orderId);
}