using MazadZone.Application.Services;
using MazadZone.Domain.Orders.Events;
using MazadZone.Domain.Repositories;
using MediatR;

namespace MazadZone.Application.Features.Orders.Commands.Create;

public sealed class BroadcastOrderCreatedHandler
    : INotificationHandler<OrderCreatedDomainEvent>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IOrderStreamService _orderStreamService;

    public BroadcastOrderCreatedHandler(
        IOrderRepository orderRepository,
        IOrderStreamService orderStreamService)
    {
        _orderRepository = orderRepository;
        _orderStreamService = orderStreamService;
    }

    public async Task Handle(OrderCreatedDomainEvent notification, CancellationToken ct)
    {
        var order = await _orderRepository.GetByIdAsync(notification.OrderId, ct);
        if (order is null) return;

        await _orderStreamService.BroadcastOrderCreatedAsync(
            notification.BidderId.Value,
            notification.OrderId.Value,
            order.AuctionId.Value,
            order.TotalAmount.Amount,
            ct);
    }
}
