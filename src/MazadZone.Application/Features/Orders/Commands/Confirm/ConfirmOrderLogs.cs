namespace MazadZone.Application.Features.Orders.Commands.Confirm;

internal static partial class ConfirmOrderLogs
{
    [LoggerMessage(
        EventId = MazadLogEvents.Orders.ConfirmAttempt, 
        Level = LogLevel.Information, 
        Message = "Attempting to confirm order with ID: {OrderId}")]
    public static partial void LogAttempt(ILogger logger, OrderId orderId);

    [LoggerMessage(
        EventId = MazadLogEvents.Orders.ConfirmDomainViolation, 
        Level = LogLevel.Warning, 
        Message = "Domain logic prevented confirmation for Order {OrderId}. Reason: {Reason}")]
    public static partial void LogDomainViolation(ILogger logger, OrderId orderId, string reason);

    [LoggerMessage(
        EventId = MazadLogEvents.Orders.ConfirmSuccess, 
        Level = LogLevel.Information, 
        Message = "Order {OrderId} successfully confirmed and persisted.")]
    public static partial void LogSuccess(ILogger logger, OrderId orderId);
}