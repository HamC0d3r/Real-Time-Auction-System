namespace MazadZone.Application.Features.Orders.Commands.AddFeedback;

internal static partial class AddFeedbackLogs
{
    [LoggerMessage(
        EventId = MazadLogEvents.Orders.AddFeedbackAttempt, 
        Level = LogLevel.Information, 
        Message = "Attempting to add feedback for order {OrderId}. Rating: {Rating}")]
    public static partial void LogAttempt(ILogger logger, OrderId orderId, int rating);

    [LoggerMessage(
        EventId = MazadLogEvents.Orders.AddFeedbackDomainViolation, 
        Level = LogLevel.Warning, 
        Message = "Domain logic prevented adding feedback for Order {OrderId}. Reason: {Reason}")]
    public static partial void LogDomainViolation(ILogger logger, OrderId orderId, string reason);

    [LoggerMessage(
        EventId = MazadLogEvents.Orders.AddFeedbackSuccess, 
        Level = LogLevel.Information, 
        Message = "Feedback successfully added to Order {OrderId} and persisted.")]
    public static partial void LogSuccess(ILogger logger, OrderId orderId);
}