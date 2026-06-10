
using MazadZone.Application.Features.Notifications.Commands.CreateNotification;
using MazadZone.Application.Features.Notifications.Enums;
using MazadZone.Application.Services;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Auctions.Events;
using MazadZone.Domain.Repositories;
using MazadZone.Domain.Users.ValueObjects;


namespace MazadZone.Application.Features.Auctions.Commands.ActivateAuction.EventHandlers;
/// <summary>
/// Handles the notification of auction started events.
/// </summary>
public class NotifyAuctionStartedDomainEventHandler 
(
    ILogger<NotifyAuctionStartedDomainEventHandler> _logger,
    IAuctionRepository _auctionRepository,
    IItemRepository _itemRepository,
    ISender _sender
): INotificationHandler<AuctionStartedDomainEvent>
{
    public async Task Handle(AuctionStartedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Handling AuctionStartedDomainEvent for Auction ID: {AuctionId}", notification.AuctionId);

        var auction = await _auctionRepository.GetByIdAsync(notification.AuctionId, cancellationToken);
        if (auction is null)
        {
            _logger.LogWarning("Auction with ID {AuctionId} not found for start event.", notification.AuctionId);
            return;
        }

        var item = await _itemRepository.GetItemByIdAsync(auction.Item.Id.Value, cancellationToken);
        
        if (item is null)
        {
            _logger.LogWarning("Item with ID {ItemId} not found for auction ID {AuctionId}.", auction.Item.Id.Value, notification.AuctionId);
            return;
        }
        
        var itemTitle = item?.Title ?? "???";

        var subject = $"Your auction '{itemTitle}' has started!";
        var body = $"Dear seller,\n\nYour auction '{itemTitle}' has just started at {auction.StartTime.ToLocalTime():f}. " +
                   $"It will end on {auction.EndTime.ToLocalTime():f}.\n\nBest of luck!\nMazadZone Team";

        var notificationId = await _sender.Send(
        new CreateNotificationCommand(
            UserId.Load(auction.SellerId.Value),
            NotificationMethods.ReceiveNotification,
            subject,
            body),
        cancellationToken);

        _logger.LogInformation("Finished handling AuctionStartedDomainEvent for Auction ID: {AuctionId}", notification.AuctionId);
    }

}

