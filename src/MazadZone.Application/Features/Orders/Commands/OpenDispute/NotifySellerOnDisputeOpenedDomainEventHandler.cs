using MazadZone.Domain.Orders.Events;
using MazadZone.Domain.Repositories;

namespace MazadZone.Application.Features.Orders.Commands.OpenDispute;

/// <summary>
/// Notifies the seller that a dispute has been filed against one of their orders.
/// </summary>
public sealed class NotifySellerOnDisputeOpenedDomainEventHandler 
    : INotificationHandler<DisputeOpenedDomainEvent>
{
    private readonly ISellerRepository _sellerRepository;
    private readonly IOrderRepository _orderRepository;
    private readonly INotificationRepository _notificationRepository;

    public NotifySellerOnDisputeOpenedDomainEventHandler(
        ISellerRepository sellerRepository,
        IOrderRepository orderRepository,
        INotificationRepository notificationRepository)
    {
        _sellerRepository = sellerRepository;
        _orderRepository = orderRepository;
        _notificationRepository = notificationRepository;
    }

    public async Task Handle(DisputeOpenedDomainEvent notification, CancellationToken ct)
    {
        var order = await _orderRepository.GetByIdAsync(notification.OrderId.Value, ct);
        if (order is null) return;

        var seller = await _sellerRepository.GetByAuctionIdAsync(order.AuctionId, ct);
        if (seller is null) return;

        const string title = "Urgent: Dispute Opened for Order #{0}";
        var message = $@"A dispute has been opened for Order #{order.Id.Value}. 
                    Please review the bidder's claim in your dashboard. Note that the payout for this auction has been 
                    temporarily placed on hold until the dispute is resolved. We recommend contacting the bidder to reach a mutual agreement.";

        await _notificationRepository.NotifySellerAsync(
            seller.Id.Value, 
            string.Format(title, order.Id.Value),
            message,
            ct);
    }
}