using MazadZone.Domain.Orders.Events;
using MazadZone.Domain.Repositories;

namespace MazadZone.Application.Features.Orders.Commands.Deliver; 

/// <summary>
/// Notifies the bidder that their item has arrived and prompts them to leave a review for the seller.
/// </summary>
public sealed class NotifyBidderOnOrderDeliveredDomainEventHandler 
    : INotificationHandler<OrderDeliveredDomainEvent>
{
    private readonly INotificationRepository _notificationService;

    public NotifyBidderOnOrderDeliveredDomainEventHandler(
        INotificationRepository notificationService)
    {
        _notificationService = notificationService;
    }

    public async Task Handle(OrderDeliveredDomainEvent notification, CancellationToken ct)
    {
        const string title = "Item Delivered! How was your experience? ⭐";

        var message = $@"Great news! Your item from Order #{notification.OrderId.Value} has been delivered. 
        Please take a moment to leave feedback for the seller. Your reviews help keep the MazadZone community safe and reliable!";

        await _notificationService.NotifyBidderAsync(
            notification.BidderId.Value,
            title,
            message);
    }
}