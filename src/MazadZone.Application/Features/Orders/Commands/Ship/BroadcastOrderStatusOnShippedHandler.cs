using MazadZone.Application.Services;
using MazadZone.Domain.Orders.Events;
using MazadZone.Domain.Repositories;
using MediatR;

namespace MazadZone.Application.Features.Orders.Commands.Ship;

public sealed class BroadcastOrderStatusOnShippedHandler
    : INotificationHandler<OrderShippedDomainEvent>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IOrderStreamService _orderStreamService;

    public BroadcastOrderStatusOnShippedHandler(
        IOrderRepository orderRepository,
        IOrderStreamService orderStreamService)
    {
        _orderRepository = orderRepository;
        _orderStreamService = orderStreamService;
    }

    public async Task Handle(OrderShippedDomainEvent notification, CancellationToken ct)
    {
        var order = await _orderRepository.GetByIdAsync(notification.OrderId, ct);
        if (order is null) return;

        await _orderStreamService.BroadcastOrderStatusChangedAsync(
            notification.BidderId.Value,
            notification.OrderId.Value,
            order.Status.ToString(),
            ct);
    }
}
