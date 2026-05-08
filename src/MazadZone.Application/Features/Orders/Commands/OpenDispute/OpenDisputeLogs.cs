namespace MazadZone.Application.Features.Orders.Commands.OpenDispute;

internal static partial class OpenDisputeLogs
{
    [LoggerMessage(
        EventId = MazadLogEvents.Orders.OpenDisputeAttempt, 
        Level = LogLevel.Information, 
        Message = "Attempting to open dispute for order with ID: {OrderId}. Reason: {Reason}")]
    public static partial void LogAttempt(ILogger logger, OrderId orderId, string reason);

    [LoggerMessage(
        EventId = MazadLogEvents.Orders.OpenDisputeDomainViolation, 
        Level = LogLevel.Warning, 
        Message = "Domain logic prevented opening dispute for Order {OrderId}. Reason: {Error}")]
    public static partial void LogDomainViolation(ILogger logger, OrderId orderId, string error);

    [LoggerMessage(
        EventId = MazadLogEvents.Orders.OpenDisputeSuccess, 
        Level = LogLevel.Information, 
        Message = "Dispute successfully opened for Order {OrderId} and persisted.")]
    public static partial void LogSuccess(ILogger logger, OrderId orderId);
}