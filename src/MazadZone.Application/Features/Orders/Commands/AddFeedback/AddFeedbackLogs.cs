using MazadZone.Domain.Orders;
using Microsoft.Extensions.Logging;

namespace MazadZone.Application.Features.Orders.Commands.AddFeedback;

internal static partial class AddFeedbackLogs
{
    // Add Feedback Events (IDs 10 - 19)
    [LoggerMessage(EventId = 10, Level = LogLevel.Information, Message = "Attempting to add feedback for order {OrderId}. Rating: {Rating}")]
    public static partial void LogAddFeedbackAttempt(this ILogger logger, OrderId orderId, int rating);

    [LoggerMessage(EventId = 11, Level = LogLevel.Warning, Message = "Domain logic prevented adding feedback for Order {OrderId}. Reason: {Reason}")]
    public static partial void LogAddFeedbackFailed(this ILogger logger, OrderId orderId, string reason);

    [LoggerMessage(EventId = 12, Level = LogLevel.Information, Message = "Feedback successfully added to Order {OrderId} and persisted.")]
    public static partial void LogFeedbackAddedSuccessfully(this ILogger logger, OrderId orderId);
}