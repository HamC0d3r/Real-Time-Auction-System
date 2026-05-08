namespace MazadZone.Application.Features.Orders.Commands.CancelOrder;

internal static partial class CancelOrderLogs
{
    [LoggerMessage(
        EventId = MazadLogEvents.Orders.CancelAttempt, 
        Level = LogLevel.Information, 
        Message = "Attempting to cancel order with ID: {OrderId}")]
    public static partial void LogAttempt(ILogger logger, OrderId orderId);

    [LoggerMessage(
        EventId = MazadLogEvents.Orders.CancelDomainViolation, 
        Level = LogLevel.Warning, 
        Message = "Domain logic prevented cancellation for Order {OrderId}. Reason: {Reason}")]
    public static partial void LogDomainViolation(ILogger logger, OrderId orderId, string reason);

    [LoggerMessage(
        EventId = MazadLogEvents.Orders.CancelSuccess, 
        Level = LogLevel.Information, 
        Message = "Order {OrderId} successfully cancelled and persisted.")]
    public static partial void LogSuccess(ILogger logger, OrderId orderId);
}