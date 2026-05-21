
using MazadZone.Application.Features.Notifications.Commands.CreateNotification;
using MazadZone.Application.Services;
using MazadZone.Domain.Auctions.Events;
using MazadZone.Domain.Notifications;
using MazadZone.Domain.Repositories;
using MazadZone.Domain.Users.ValueObjects;


namespace MazadZone.Application.Features.Auctions.Commands.ActivateAuction.EventHandlers;
/// <summary>
/// Handles the notification of auction started events.
/// </summary>
public class NotifyAuctionStartedDomainEventHandler 
(
    IAuctionRepository _auctionRepository,
    IItemRepository _itemRepository,
    ISender _sender,
    IRealTimeNotificationService _realTimeNotificationService
): INotificationHandler<AuctionStartedDomainEvent>
{
    public async Task Handle(AuctionStartedDomainEvent notification, CancellationToken cancellationToken)
    {
        var auction = await _auctionRepository.GetByIdAsync(notification.AuctionId, cancellationToken);
        if (auction is null)
        {
            return;
        }

        var item = await _itemRepository.GetItemByIdAsync(auction.Item.Id.Value, cancellationToken);
        
        if (item is null)
        {
            return;
        }
        
        var itemTitle = item?.Title ?? "???";


        
        var subject = $"Your auction '{itemTitle}' has started!";
        var body = $"Dear seller,\n\nYour auction '{itemTitle}' has just started at {auction.StartTime.ToLocalTime():f}. " +
                   $"It will end on {auction.EndTime.ToLocalTime():f}.\n\nBest of luck!\nMazadZone Team";

        var notificationId = await _sender.Send(
        new CreateNotificationCommand(
            UserId.Load(auction.SellerId.Value),
            subject,
            body),
        cancellationToken);

        await _realTimeNotificationService
            .SendNotificationAsync(
                auction.SellerId.Value,
                notificationId.Value);
   
    }
}

