using MazadZone.Application.Features.Notifications.Commands.CreateNotification;
using MazadZone.Application.Features.Notifications.Enums;
using MazadZone.Application.Services;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Auctions.Events;
using MazadZone.Domain.Repositories;
using MazadZone.Domain.Users.ValueObjects;

namespace MazadZone.Application.Features.Auctions.Commands.EndAuction.EventHandlers;
/// <summary>
/// Handles the notification of auction ended events.
/// </summary>
/// <typeparam name="NotifyAuctionEndedEventHandler"></typeparam>
public class NotifyAuctionEndedEventHandler 
( 
    ILogger<NotifyAuctionEndedEventHandler> _logger,
    IAuctionRepository _auctionRepository, 
    IItemRepository _itemRepository,
    ISender _sender
): INotificationHandler<AuctionEndedDomainEvent>
{

    public async Task Handle(AuctionEndedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Handling AuctionEndedDomainEvent for Auction ID: {AuctionId}", notification.AuctionId);
        
       var auction = await _auctionRepository.GetByIdAsync(notification.AuctionId, cancellationToken);
        if (auction is null)
        {
            _logger.LogWarning("Auction with ID {AuctionId} not found for end event.", notification.AuctionId);
            return;
        }
        
        var item = await _itemRepository.GetItemByIdAsync(auction.Item.Id.Value, cancellationToken);
        var itemTitle = item?.Title ?? "your auction item";

        var title = $"Auction Ended: {itemTitle}";
        var message = $"The auction for {itemTitle} has ended. The winning bid was {auction.CurrentHighestBidAmount:C}. Thank you for participating!";
        
        _logger.LogInformation("Sending notification for auction ended for Auction ID: {AuctionId}", notification.AuctionId);
        if (auction.Bids.Any())
        {
            // Notify all bidders about the Auction ended
            foreach (var bid in auction.Bids)
            {
                var cancellationNotificationId = await _sender.Send(new CreateNotificationCommand(
                    UserId: UserId.Load(bid.BidderId.Value),
                    NotificationMethods.ReceiveNotification,
                    Title: title,
                    Message: message
                ), cancellationToken);
                
            }
        }
        _logger.LogInformation("Finished handling AuctionEndedDomainEvent for Auction ID: {AuctionId}", notification.AuctionId);
    }
}