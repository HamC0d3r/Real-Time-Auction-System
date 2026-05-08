using MazadZone.Application.Services;
using MazadZone.Domain.Repositories;
using MazadZone.Domain.Users.Events;

namespace MazadZone.Application.Features.Users.Commands.Ban.Events;

public class CancelAuctionsHandler : INotificationHandler<UserBannedDomainEvent>
{
    private readonly ILogger<CancelAuctionsHandler> _logger;
    private readonly IAuctionRepository _auctionRepository;
    private readonly INotificationRepository _notificationRepo;
    private readonly IUserRepository _userRepository;
    private readonly IAuctionQueries _auctionQueries;

    public CancelAuctionsHandler(
        ILogger<CancelAuctionsHandler> logger,
        IAuctionRepository auctionRepository,
        INotificationRepository notificationRepo,
        IUserRepository userRepository,
        IAuctionQueries auctionQueries
    )
    {
        _logger = logger;
        _auctionRepository = auctionRepository;
        _notificationRepo = notificationRepo;
        _userRepository = userRepository;
        _auctionQueries = auctionQueries;
    }

    public async Task Handle(UserBannedDomainEvent notification, CancellationToken ct)
    {
        var isSeller = await _userRepository.IsUserSellerAsync(notification.UserId, ct);

        if (!isSeller)
        {
            return; // Exit early, nothing to do.
        }

        // 1. Get notification data via Repository
        var activeAuctions = await _auctionQueries.GetActiveAuctionsWithBiddersBySellerIdAsync(notification.UserId, ct);

        // 2. Perform bulk termination
        int totalTerminated = await _auctionRepository.TerminateAllAuctionsBySellerIdAsync(
            notification.UserId,
            notification.Reason,
            ct);

        // 3. Orchestrate Notifications
        foreach (var auction in activeAuctions)
        {
            foreach (var bidderId in auction.Bidders)
            {
                await _notificationRepo.NotifyBidderAsync(
                    bidderId,
                    "Auction Unavailable",
                    $"Auction '{auction.Title}' is no longer available.");
            }
        }

        BanUserLogs.LogAuctionsCancelled(_logger, notification.UserId, totalTerminated);
    }
}