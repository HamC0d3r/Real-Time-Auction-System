using Microsoft.Extensions.Logging;
using MazadZone.Domain.Entities.Orders;

namespace MazadZone.Application.Features.Orders.Commands.ResolveDispute;

internal static partial class ResolveDisputeLogs
{
    // Resolve Dispute Events (IDs 70 - 79)
    [LoggerMessage(EventId = 70, Level = LogLevel.Information, Message = "Attempting to resolve dispute for order with ID: {OrderId}. Resolution: {Resolution}")]
    public static partial void LogResolveDisputeAttempt(this ILogger logger, OrderId orderId, string resolution);

    [LoggerMessage(EventId = 71, Level = LogLevel.Warning, Message = "Domain logic prevented resolving dispute for Order {OrderId}. Reason: {Error}")]
    public static partial void LogResolveDisputeFailed(this ILogger logger, OrderId orderId, string error);

    [LoggerMessage(EventId = 72, Level = LogLevel.Information, Message = "Dispute successfully resolved for Order {OrderId} and persisted.")]
    public static partial void LogOrderDisputeResolvedSuccessfully(this ILogger logger, OrderId orderId);
}