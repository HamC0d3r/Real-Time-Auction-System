using MazadZone.Application.Features.Notifications.Commands.CreateNotification;
using MazadZone.Application.Features.Notifications.Enums;
using MazadZone.Application.Services;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Auctions.Events;
using MazadZone.Domain.Repositories;
using MazadZone.Domain.Users.ValueObjects;

namespace MazadZone.Application.Features.Auctions.Commands.CreateAuction.EventHandlers;

public class NotifyAuctionCreatedEventHandler
(
    IItemRepository _itemRepository,
    ISender _sender,
    ILogger<NotifyAuctionCreatedEventHandler> _logger,
    IAuctionRepository _auctionRepository
)
 : INotificationHandler<AuctionCreatedDomainEvent>
{
    
    public async Task Handle(AuctionCreatedDomainEvent notification, CancellationToken cancellationToken)
    {

        _logger.LogInformation("Handling AuctionCreatedDomainEvent for Auction ID: {AuctionId}", notification.AuctionId);

        var auction = await _auctionRepository.GetByIdAsync(notification.AuctionId, cancellationToken);
        if (auction is null)
        {
            _logger.LogWarning("Auction with ID {AuctionId} not found for creation event.", notification.AuctionId);
            return;
        }
        
        var item = await _itemRepository.GetItemByIdAsync(auction.Item.Id.Value, cancellationToken);
        
        if (item is null)
        {
            _logger.LogWarning("Item with ID {ItemId} not found for auction ID {AuctionId}.", auction.Item.Id.Value, notification.AuctionId);
            return;
        }

        var itemTitle = item?.Title ?? "your auction item";
        var title = $"Auction Created: {itemTitle}";
        var message = $"Your auction for {itemTitle} has been successfully created and is now live! Start bidding to attract potential buyers.";
        
        // Send notification to the seller about the auction creation
        _logger.LogInformation("Sending notification for auction creation for Auction ID: {AuctionId}", notification.AuctionId);
        var notificationId = await _sender.Send(
                new CreateNotificationCommand(
                    UserId.Load(auction.SellerId.Value),
                    NotificationMethods.ReceiveNotification,
                    title,
                    message),
                cancellationToken);


        _logger.LogInformation("Finished handling AuctionCreatedDomainEvent for Auction ID: {AuctionId}", notification.AuctionId);
    }
}
