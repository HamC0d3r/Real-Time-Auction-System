using MazadZone.Application.Services;
using MazadZone.Domain.Repositories;
using MazadZone.Domain.Users.Events;

namespace MazadZone.Application.Features.Users.Commands.Ban.Events;
public class RemoveActiveBidsHandler : INotificationHandler<UserBannedDomainEvent>
{
    private readonly IAuctionRepository _auctionRepository;
    private readonly IUserRepository _userRepository;
    private readonly IAuctionQueries _auctionQueries;
    private readonly INotificationRepository _notificationRepo;
    private readonly ILogger<RemoveActiveBidsHandler> _logger;

    public RemoveActiveBidsHandler(
        IAuctionRepository auctionRepository,
        IUserRepository userRepository,
        IAuctionQueries auctionQueries,
        INotificationRepository notificationRepo,
        ILogger<RemoveActiveBidsHandler> logger
    )
    {
        _auctionRepository = auctionRepository;
        _userRepository = userRepository;
        _auctionQueries = auctionQueries;
        _notificationRepo = notificationRepo;
        _logger = logger;
    }

    public async Task Handle(UserBannedDomainEvent notification, CancellationToken ct)
    {
        var isBidder = await _userRepository.IsBidderAsync(notification.UserId, ct);

        // Maybe Admin Account 
        if (!isBidder)
        {
            return; // Exit early, nothing to do.
        }

        // 1. READ: Identify which auctions are affected before we delete the bids
        // We need the Auction Title, SellerId, and OTHER Bidders to notify them
        var affectedAuctions = await _auctionQueries.GetAuctionsByBidderIdAsync(notification.UserId, ct);
        
        if (!affectedAuctions.Any()) return;

        // 2. WRITE: Bulk delete all active bids for this user
        int bidsRemoved = await _auctionRepository.RemoveActiveBidsByBidderIdAsync(notification.UserId, ct);

        // 3. ORCHESTRATE: Notify the stakeholders
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

        // 4. LOG: Use your Source Generator
        BanUserLogs.LogBidsRemoved(_logger, notification.UserId, bidsRemoved);

    }
}