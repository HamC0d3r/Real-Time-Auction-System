using Microsoft.Extensions.Logging;
using MazadZone.Domain.Entities.Orders;
using MazadZone.Domain.Orders;

namespace MazadZone.Application.Common.Logging;

/// <summary>
/// Contains globally shared logging scopes and events for the Order domain.
/// </summary>
public static partial class OrderSharedLogs
{
    // High-Performance Zero-Allocation Scope
    private static readonly Func<ILogger, Guid, IDisposable?> _orderScope =
        LoggerMessage.DefineScope<Guid>("OrderId: {OrderId}");

    public static IDisposable? BeginOrderScope(this ILogger logger, OrderId orderId)
    {
        return _orderScope(logger, orderId.Value);
    }

    // Shared Events (IDs 1 - 9)
    [LoggerMessage(EventId = 1, Level = LogLevel.Warning, Message = "Failed to process order: Order {OrderId} was not found.")]
    public static partial void LogOrderNotFound(this ILogger logger, OrderId orderId);
}