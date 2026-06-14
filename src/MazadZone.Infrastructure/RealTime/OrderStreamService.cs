using MazadZone.Application.Features.Orders.Constants;
using MazadZone.Application.Features.Orders.DTOs;
using MazadZone.Application.Services;
using MazadZone.Infrastructure.RealTime.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace MazadZone.Infrastructure.RealTime;

public class OrderStreamService(
    IHubContext<OrdersHub> _hubContext
    ) : IOrderStreamService
{
    public async Task BroadcastOrderStatusChangedAsync(Guid userId, Guid orderId, string newStatus, CancellationToken cancellationToken = default)
    {
        var dto = new OrderStatusUpdateDto(orderId, newStatus, DateTime.UtcNow);
        await _hubContext.Clients.User(userId.ToString()).SendAsync(BroadcastOrderUpdateTypes.OrderStatusChanged, dto, cancellationToken);
    }

    public async Task BroadcastOrderCreatedAsync(Guid userId, Guid orderId, Guid auctionId, decimal finalBid, CancellationToken cancellationToken = default)
    {
        var dto = new OrderCreatedUpdateDto(orderId, auctionId, finalBid);
        await _hubContext.Clients.User(userId.ToString()).SendAsync(BroadcastOrderUpdateTypes.OrderCreated, dto, cancellationToken);
    }
}
