
using MazadZone.Application.Common.Interfaces;
using MazadZone.Application.Services;
using MazadZone.Domain.Auctions.Events;
using MazadZone.Domain.Repositories;

namespace MazadZone.Application.Features.Auctions.Commands.ActivateAuction.EventHandlers;
/// <summary>
/// Handles the sending of email notifications when an auction starts. It retrieves the auction and item details, constructs an email, and sends it to the seller using the email service. Logs any issues encountered during the process.
/// </summary>
/// <param name="_emailService"></param>
/// <param name="_auctionRepository"></param>
/// <param name="_itemRepository"></param>
/// <param name="_userQueries"></param> <summary>
/// 
/// </summary>
public class SendEmailAuctionStartedDomainEventHandler
(
    IEmailService _emailService,
    IAuctionRepository _auctionRepository,
    IItemRepository _itemRepository,
    IUserQueries _userQueries
)
 : INotificationHandler<AuctionStartedDomainEvent>
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

        var sellerUserInfo = await _userQueries.GetEmailByIdAsync(auction.SellerId.Value, cancellationToken);

        // Send email using the seller's available contact information.
        // TODO: replace with seller email once the seller/user contact details are available in the domain model.
        var sellerEmail = sellerUserInfo?.Value;

        if (string.IsNullOrEmpty(sellerEmail))
        {
            return;
        }

        var subject = $"Your auction '{itemTitle}' has started!";
        var body = $"Dear seller,\n\nYour auction '{itemTitle}' has just started at {auction.StartTime.ToLocalTime():f}. " +
                   $"It will end on {auction.EndTime.ToLocalTime():f}.\n\nBest of luck!\nMazadZone Team";


        var EmailRequest = new EmailRequest(sellerEmail, subject, body);

        // Send email to the seller
        await _emailService.SendEmailAsync(EmailRequest);
    }
}

