using MazadZone.Application.Services;
using MazadZone.Domain.Orders.Events;
using MazadZone.Domain.Repositories;
using MediatR;

namespace MazadZone.Application.Features.Orders.Commands.Cancel;

public sealed class BroadcastOrderStatusOnCancelledHandler
    : INotificationHandler<OrderCancelledDomainEvent>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IOrderStreamService _orderStreamService;

    public BroadcastOrderStatusOnCancelledHandler(
        IOrderRepository orderRepository,
        IOrderStreamService orderStreamService)
    {
        _orderRepository = orderRepository;
        _orderStreamService = orderStreamService;
    }

    public async Task Handle(OrderCancelledDomainEvent notification, CancellationToken ct)
    {
        var order = await _orderRepository.GetByIdAsync(notification.OrderId, ct);
        if (order is null) return;

        await _orderStreamService.BroadcastOrderStatusChangedAsync(
            order.BidderId.Value,
            notification.OrderId.Value,
            order.Status.ToString(),
            ct);
    }
}
