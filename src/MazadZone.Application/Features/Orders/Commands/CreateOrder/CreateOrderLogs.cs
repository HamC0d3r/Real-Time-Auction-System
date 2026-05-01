using Microsoft.Extensions.Logging;
using MazadZone.Domain.Entities.Orders;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Orders;

namespace MazadZone.Application.Features.Orders.Commands.CreateOrder;

internal static partial class CreateOrderLogs
{
    // Create Order Events (IDs 40 - 49)
    [LoggerMessage(EventId = 40, Level = LogLevel.Information, Message = "Attempting to create order from Winning Bid: {WinningBidId}")]
    public static partial void LogCreateOrderAttempt(this ILogger logger, BidId winningBidId);

    [LoggerMessage(EventId = 41, Level = LogLevel.Warning, Message = "Domain logic prevented order creation. Reason: {Reason}")]
    public static partial void LogCreateOrderFailed(this ILogger logger, string reason);

    [LoggerMessage(EventId = 42, Level = LogLevel.Information, Message = "Order {OrderId} successfully created and persisted.")]
    public static partial void LogOrderCreatedSuccessfully(this ILogger logger, OrderId orderId);
}