namespace MazadZone.Application.Features.Orders.Commands.ResolveDispute;

internal static partial class ResolveDisputeLogs
{
    [LoggerMessage(
        EventId = MazadLogEvents.Orders.ResolveDisputeAttempt, 
        Level = LogLevel.Information, 
        Message = "Attempting to resolve dispute for order with ID: {OrderId}. Resolution: {Resolution}")]
    public static partial void LogAttempt(ILogger logger, OrderId orderId, string resolution);

    [LoggerMessage(
        EventId = MazadLogEvents.Orders.ResolveDisputeDomainViolation, 
        Level = LogLevel.Warning, 
        Message = "Domain logic prevented resolving dispute for Order {OrderId}. Reason: {Error}")]
    public static partial void LogDomainViolation(ILogger logger, OrderId orderId, string error);

    [LoggerMessage(
        EventId = MazadLogEvents.Orders.ResolveDisputeSuccess, 
        Level = LogLevel.Information, 
        Message = "Dispute successfully resolved for Order {OrderId} and persisted.")]
    public static partial void LogSuccess(ILogger logger, OrderId orderId);
}