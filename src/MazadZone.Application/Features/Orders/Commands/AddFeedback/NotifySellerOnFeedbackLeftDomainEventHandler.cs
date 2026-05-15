using MazadZone.Domain.Orders.Events;
using MazadZone.Domain.Repositories;

namespace MazadZone.Application.Features.Orders.Commands.AddFeedback;
public sealed class NotifySellerOnFeedbackLeftDomainEventHandler : INotificationHandler<FeedbackLeftDomainEvent>
{
    private readonly INotificationRepository _notificationService;
    private readonly ISellerRepository _sellerRepository;

    public NotifySellerOnFeedbackLeftDomainEventHandler(INotificationRepository notificationService, ISellerRepository sellerRepository)
    {
        _notificationService = notificationService;
        _sellerRepository = sellerRepository;
    }

    public async Task Handle(FeedbackLeftDomainEvent notification, CancellationToken ct)
    {
        var seller = await _sellerRepository.GetByAuctionIdAsync(notification.AuctionId, ct);
        if (seller is null) return;
        
        await _notificationService.NotifySellerAsync(
            seller.Id.Value, 
            "New Feedback Received",
            $"You received a {notification.Rating}-star review!", 
            ct);
    }
}