using MazadZone.Domain.Orders.Events;
using MazadZone.Domain.Repositories;

namespace MazadZone.Application.Features.Orders.Commands.Ship;

/// <summary>
/// Notifies the bidder that their won item has been shipped and is on its way.
/// </summary>
public sealed class NotifyBidderOnOrderShippedDomainEventHandler 
    : INotificationHandler<OrderShippedDomainEvent>
{
    private readonly INotificationRepository _notificationService;

    public NotifyBidderOnOrderShippedDomainEventHandler(
        INotificationRepository notificationService)
    {
        _notificationService = notificationService;
    }

    public async Task Handle(OrderShippedDomainEvent notification, CancellationToken ct)
    {
        // 2. Create a high-energy, positive title
        const string title = "Your Order is on the Way! 🚚";

        // 3. Draft the message
        var message = $@"Great news! Your item from Order #{notification.OrderId.Value} has been shipped by the seller. 
                        
You can track your package details in your 'My Won Auctions' dashboard. We hope you enjoy your purchase!";

        // 4. Send the notification to the Bidder
        await _notificationService.NotifyBidderAsync(
            notification.BidderId.Value, 
            title, 
            message);
    }
}