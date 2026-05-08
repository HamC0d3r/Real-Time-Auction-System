namespace MazadZone.Application.Features.Orders.Commands.DeliverOrder;

internal static partial class DeliverOrderLogs
{
    [LoggerMessage(
        EventId = MazadLogEvents.Orders.DeliverAttempt, 
        Level = LogLevel.Information, 
        Message = "Attempting to deliver order with ID: {OrderId}")]
    public static partial void LogAttempt(ILogger logger, OrderId orderId);

    [LoggerMessage(
        EventId = MazadLogEvents.Orders.DeliverDomainViolation, 
        Level = LogLevel.Warning, 
        Message = "Domain logic prevented delivery for Order {OrderId}. Reason: {Reason}")]
    public static partial void LogDomainViolation(ILogger logger, OrderId orderId, string reason);

    [LoggerMessage(
        EventId = MazadLogEvents.Orders.DeliverSuccess, 
        Level = LogLevel.Information, 
        Message = "Order {OrderId} successfully delivered and persisted.")]
    public static partial void LogSuccess(ILogger logger, OrderId orderId);
}