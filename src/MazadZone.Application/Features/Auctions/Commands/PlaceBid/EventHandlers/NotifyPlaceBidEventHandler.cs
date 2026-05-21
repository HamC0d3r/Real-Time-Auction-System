
using MazadZone.Application.Features.Notifications.Commands.CreateNotification;
using MazadZone.Application.Services;
using MazadZone.Domain.Auctions.Events;
using MazadZone.Domain.Repositories;
using MazadZone.Domain.Users.ValueObjects;

namespace MazadZone.Application.Features.Auctions.Commands.PlaceBid.EventHandlers;


/// <summary>
/// Handles the BidPlacedDomainEvent to notify previous bidders that they have been outbid.
/// </summary>
/// <remarks>
/// This event handler listens for the BidPlacedDomainEvent, which is raised whenever a new bid is successfully placed on an auction.
/// When a new bid is placed, this handler retrieves the auction details and identifies all previous bidders who have been outbid by the new bid.
/// It then sends a notification to each of these outbid bidders, informing them of the new highest bid and encouraging them to place a new bid if they wish to remain competitive.
/// </remarks>
public class NotifyPlaceBidEventHandler
(
    IAuctionRepository _auctionRepository,
    IRealTimeNotificationService _realTimeNotificationService,
    ILogger<NotifyPlaceBidEventHandler> _logger,
    IItemRepository _itemRepository,
    ISender _sender
) : INotificationHandler<BidPlacedDomainEvent>
{
    public async Task Handle(
        BidPlacedDomainEvent notification,
        CancellationToken cancellationToken)
    {
        var auction = await _auctionRepository
            .GetByIdAsync(notification.AuctionId, cancellationToken);

        if (auction is null)
        {
            _logger.LogWarning(
                "Auction with ID {AuctionId} not found.",
                notification.AuctionId);

            return;
        }

        var item = await _itemRepository
            .GetItemByIdAsync(auction.Item.Id.Value, cancellationToken);

        var itemTitle = item?.Title ?? "your auction item";

        var title = $"New Bid Placed on {itemTitle}";

        var message =
            $"A new bid has been placed on {itemTitle}. " +
            $"Current highest bid is {auction.CurrentHighestBidAmount:C}";

        var biddersToNotify = auction.Bids
            .Where(x => x.BidderId != auction.CurrentLeadingBid.BidderId) // Exclude the current highest bidder
            .Select(x => x.BidderId)
            .Distinct()
            .ToList();

        foreach (var bidderId in biddersToNotify)
        {
            // Create a notification for the outbid bidder
            var notificationId = await _sender.Send(
                new CreateNotificationCommand(
                    UserId.Load(bidderId.Value),
                    title,
                    message),
                cancellationToken);

            await _realTimeNotificationService
                .SendNotificationAsync(
                    bidderId.Value,
                    notificationId.Value,
                    cancellationToken);
        }
    }
}