using MazadZone.Application.Services;
using MazadZone.Domain.Repositories;
using MazadZone.Domain.Users.Events;

namespace MazadZone.Application.Features.Users.Commands.Suspend.Events;
public class CancelAuctionsOnSuspensionHandler : INotificationHandler<UserSuspendedDomainEvent>
{
    private readonly ILogger<CancelAuctionsOnSuspensionHandler> _logger;
    private readonly IAuctionRepository _auctionRepository;
    private readonly INotificationRepository _notificationRepo;
    private readonly IUserRepository _userRepository;
    private readonly IAuctionQueries _auctionQueries;

    public CancelAuctionsOnSuspensionHandler(ILogger<CancelAuctionsOnSuspensionHandler> logger, IAuctionRepository auctionRepository, INotificationRepository notificationRepo, IUserRepository userRepository, IAuctionQueries auctionQueries)
    {
        _logger = logger;
        _auctionRepository = auctionRepository;
        _notificationRepo = notificationRepo;
        _userRepository = userRepository;
        _auctionQueries = auctionQueries;
    }

    public async Task Handle(UserSuspendedDomainEvent notification, CancellationToken ct)
    {
        var isSeller = await _userRepository.IsUserSellerAsync(notification.UserId, ct);

        if (!isSeller)
        {
            return; // Exit early, nothing to do.
        }

        // Get bidders to notify via Dapper (Read Path)
        var auctions = await _auctionQueries.GetActiveAuctionsWithBiddersBySellerIdAsync(notification.UserId, ct);

        // Terminate all auctions (Write Path)
        await _auctionRepository.TerminateAllAuctionsBySellerIdAsync(notification.UserId, notification.Reason, ct);

        //  Notify Bidders
        foreach (var auction in auctions)
        {
            foreach (var bidderId in auction.Bidders)
            {
                await _notificationRepo.NotifyBidderAsync(
                    bidderId, 
                    "Auction Unavailable", 
                    $"The auction '{auction.Title}' was removed due to seller suspension.");
            }
        }
    }
}