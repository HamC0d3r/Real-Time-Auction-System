namespace MazadZone.Application.Features.Orders.Commands.ShipOrder;

internal static partial class ShipOrderLogs
{
    [LoggerMessage(
        EventId = MazadLogEvents.Orders.ShipAttempt, 
        Level = LogLevel.Information, 
        Message = "Attempting to ship order with ID: {OrderId}")]
    public static partial void LogAttempt(ILogger logger, OrderId orderId);

    [LoggerMessage(
        EventId = MazadLogEvents.Orders.ShipDomainViolation, 
        Level = LogLevel.Warning, 
        Message = "Domain logic prevented shipping for Order {OrderId}. Reason: {Error}")]
    public static partial void LogDomainViolation(ILogger logger, OrderId orderId, string error);

    [LoggerMessage(
        EventId = MazadLogEvents.Orders.ShipSuccess, 
        Level = LogLevel.Information, 
        Message = "Order {OrderId} successfully shipped and persisted.")]
    public static partial void LogSuccess(ILogger logger, OrderId orderId);
}