using MazadZone.Application.Features.Notifications.Commands.CreateNotification;
using MazadZone.Application.Services;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Auctions.Events;
using MazadZone.Domain.Notifications;
using MazadZone.Domain.Repositories;
using MazadZone.Domain.Users.ValueObjects;
using Microsoft.Extensions.Logging;

namespace MazadZone.Application.Features.Auctions.EventHandlers;
/// <summary>
/// Handles the notification of auction cancelled events.
/// </summary>
/// <typeparam name="NotifyAuctionCancelledEventHandler"></typeparam>
public class NotifyAuctionCancelledByAdminEventHandler(
    ILogger<NotifyAuctionCancelledEventHandler> _logger,
    IAuctionRepository _auctionRepository,
    IRealTimeNotificationService _realTimeNotificationService ,
    IItemRepository _itemRepository,
    ISender _sender
)
 : INotificationHandler<AuctionCancelledDomainEvent>
{

    public async Task Handle(AuctionCancelledDomainEvent notification, CancellationToken cancellationToken)
    {
        var auction = await _auctionRepository.GetByIdAsync(notification.AuctionId, cancellationToken);
        if (auction is null)
        {
            _logger.LogWarning("Auction with ID {AuctionId} not found for cancellation event.", notification.AuctionId);
            return;
        }

        if (auction.Status != AuctionStatus.Cancelled)
        {
            _logger.LogWarning("Auction with ID {AuctionId} is not in a cancelled state. Current status: {Status}", notification.AuctionId, auction.Status);
            return;
        }

        var item = await _itemRepository.GetItemByIdAsync(auction.Item.Id.Value, cancellationToken);

        if(item is null)
        {
            return;
        }
        var itemTitle = item?.Title ?? "???";

        if (auction.Bids.Any())
        {
            // Notify all bidders about the cancellation
            foreach (var bid in auction.Bids)
            {
                var cancellationNotificationId = await _sender.Send(
                    new CreateNotificationCommand(
                        UserId.Load(bid.BidderId.Value),
                        $"{itemTitle} Auction Cancelled",
                        $"{itemTitle} Auction is in a Cancelled By Admin"
                ));
                
                await _realTimeNotificationService.SendNotificationAsync(bid.BidderId.Value, cancellationNotificationId.Value);
            }
        }

        // Log the auction cancellation event
        _logger.LogInformation("Auction with ID {AuctionId} has been cancelled By Admin.", notification.AuctionId);
        
    }
}