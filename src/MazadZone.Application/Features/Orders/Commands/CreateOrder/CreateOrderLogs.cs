using MazadZone.Domain.Auctions;

namespace MazadZone.Application.Features.Orders.Commands.CreateOrder;

internal static partial class CreateOrderLogs
{
    [LoggerMessage(
        EventId = MazadLogEvents.Orders.CreateAttempt, 
        Level = LogLevel.Information, 
        Message = "Attempting to create order from Winning Bid: {WinningBidId}")]
    public static partial void LogAttempt(ILogger logger, BidId winningBidId);

    [LoggerMessage(
        EventId = MazadLogEvents.Orders.CreateDomainViolation, 
        Level = LogLevel.Warning, 
        Message = "Domain logic prevented order creation. Reason: {Reason}")]
    public static partial void LogDomainViolation(ILogger logger, string reason);

    [LoggerMessage(
        EventId = MazadLogEvents.Orders.CreateSuccess, 
        Level = LogLevel.Information, 
        Message = "Order {OrderId} successfully created and persisted.")]
    public static partial void LogSuccess(ILogger logger, OrderId orderId);
}