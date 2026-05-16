using MazadZone.Domain.Orders.Events;
using MazadZone.Domain.Repositories;

namespace MazadZone.Application.Features.Orders.Commands.ResolveDispute;
public sealed class NotifyBidderOnDisputeResolvedDomainEventHandler 
    : INotificationHandler<DisputeResolvedDomainEvent>
{
    private readonly IOrderRepository _orderRepository;
    private readonly INotificationRepository _notificationRepository;

    public NotifyBidderOnDisputeResolvedDomainEventHandler(IOrderRepository orderRepository, INotificationRepository notificationRepository)
    {
        _orderRepository = orderRepository;
        _notificationRepository = notificationRepository;
    }

    public async Task Handle(DisputeResolvedDomainEvent notification, CancellationToken ct)
    {
        var order = await _orderRepository.GetByIdAsync(notification.OrderId.Value, ct);
        if (order is null) return;

       const string title = "Dispute Resolved: Order #{0}";
        var message = $@"The dispute for your order has been resolved.
        Admin Resolution: {notification.Resolution}
        Thank you for your patience while we mediated this issue.";

        await _notificationRepository.NotifyBidderAsync(
            order.BidderId.Value,
            string.Format(title, order.Id.Value),
            message);
    }
}