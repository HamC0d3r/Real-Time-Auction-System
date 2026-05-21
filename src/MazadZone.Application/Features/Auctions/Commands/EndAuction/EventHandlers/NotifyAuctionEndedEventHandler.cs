using MazadZone.Application.Features.Auctions.Queries;
using MazadZone.Application.Features.Notifications.Commands.CreateNotification;
using MazadZone.Application.Services;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Auctions.Events;
using MazadZone.Domain.Notifications;
using MazadZone.Domain.Repositories;
using MazadZone.Domain.Users.ValueObjects;
using Microsoft.Extensions.Logging;
using MzadZone.Domain.Payments;

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
    IRealTimeNotificationService  _realTimeNotificationService,
    ISender _sender
): INotificationHandler<AuctionEndedDomainEvent>
{

    public async Task Handle(AuctionEndedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Handling AuctionEndedDomainEvent for Auction ID: {AuctionId}", notification.AuctionId);
        
        // 1. Create the Order
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
        var itemTitle = item?.Title ?? "your auction item";

        var title = $"Auction Ended: {itemTitle}";
        var message = $"The auction for {itemTitle} has ended. The winning bid was {auction.CurrentHighestBidAmount:C}. Thank you for participating!";
        if (auction.Bids.Any())
        {
            // Notify all bidders about the cancellation
            foreach (var bid in auction.Bids)
            {
                var cancellationNotificationId = await _sender.Send(new CreateNotificationCommand(
                    UserId: UserId.Load(bid.BidderId.Value),
                    Title: title,
                    Message: message
                ), cancellationToken);
                
                await _realTimeNotificationService.SendNotificationAsync(bid.BidderId.Value, cancellationNotificationId.Value, cancellationToken);
            }
        }
    }
}