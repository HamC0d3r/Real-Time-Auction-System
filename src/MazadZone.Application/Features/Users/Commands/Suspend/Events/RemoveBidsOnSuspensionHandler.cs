using MazadZone.Application.Features.Users.Commands.Suspend;
using MazadZone.Application.Services;
using MazadZone.Domain.Repositories;
using MazadZone.Domain.Users.Events;

public class RemoveBidsOnSuspensionHandler : INotificationHandler<UserSuspendedDomainEvent>
{
    private readonly IAuctionRepository _auctionRepository;
    private readonly IUserRepository _userRepository;
    private readonly IAuctionQueries _auctionQueries;
    private readonly INotificationRepository _notificationRepo;
    private readonly ILogger<RemoveBidsOnSuspensionHandler> _logger;

    public RemoveBidsOnSuspensionHandler(IAuctionRepository auctionRepository, IUserRepository userRepository, IAuctionQueries auctionQueries, INotificationRepository notificationRepo, ILogger<RemoveBidsOnSuspensionHandler> logger)
    {
        _auctionRepository = auctionRepository;
        _userRepository = userRepository;
        _auctionQueries = auctionQueries;
        _notificationRepo = notificationRepo;
        _logger = logger;
    }

    public async Task Handle(UserSuspendedDomainEvent notification, CancellationToken ct)
    {
        var isBidder = await _userRepository.IsBidderAsync(notification.UserId, ct);

        // Maybe Admin Account 
        if (!isBidder)
        {
            return; // Exit early, nothing to do.
        }

        var affectedAuctions = await _auctionQueries.GetAuctionsByBidderIdAsync(notification.UserId, ct);

        if (!affectedAuctions.Any()) return;

        int bidsRemoved = await _auctionRepository.RemoveActiveBidsByBidderIdAsync(notification.UserId, ct);

        //  Notify Sellers & Other Bidders
                foreach (var auction in affectedAuctions)
        {
            // Notify Seller
            await _notificationRepo.NotifySellerAsync(
                auction.SellerId,
                "Bid Removed",
                $"A bid was removed from '{auction.Title}' due to a bidder's account suspension.");

            // Notify Other Bidders (Price might have changed)
            foreach (var otherBidderId in auction.OtherBidderIds)
            {
                await _notificationRepo.NotifyBidderAsync(
                    otherBidderId,
                    "Auction Update",
                    $"The standing of auction '{auction.Title}' has changed after a bid removal.");
            }
        }

        SuspendUserLogs.LogBidsRemoved(_logger, notification.UserId, bidsRemoved);


    }
}