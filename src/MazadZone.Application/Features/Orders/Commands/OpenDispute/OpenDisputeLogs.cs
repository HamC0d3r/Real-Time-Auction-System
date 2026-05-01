using Microsoft.Extensions.Logging;
using MazadZone.Domain.Entities.Orders;

namespace MazadZone.Application.Features.Orders.Commands.OpenDispute;

internal static partial class OpenDisputeLogs
{
    // Open Dispute Events (IDs 60 - 69)
    [LoggerMessage(EventId = 60, Level = LogLevel.Information, Message = "Attempting to open dispute for order with ID: {OrderId}. Reason: {Reason}")]
    public static partial void LogOpenDisputeAttempt(this ILogger logger, OrderId orderId, string reason);

    [LoggerMessage(EventId = 61, Level = LogLevel.Warning, Message = "Domain logic prevented opening dispute for Order {OrderId}. Reason: {Error}")]
    public static partial void LogOpenDisputeFailed(this ILogger logger, OrderId orderId, string error);

    [LoggerMessage(EventId = 62, Level = LogLevel.Information, Message = "Dispute successfully opened for Order {OrderId} and persisted.")]
    public static partial void LogOrderDisputeOpenedSuccessfully(this ILogger logger, OrderId orderId);
}