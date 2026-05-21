using MazadZone.Application.Common.Paging;
using MazadZone.Application.Features.Auctions.DTOs;
using MazadZone.Application.Features.Auctions.Queries;
using MazadZone.Application.Features.Users.Commands.Ban.Models;
using MazadZone.Application.Features.Users.DTOs;
using MazadZone.Domain.Shared.Interfaces;
using MazadZone.Domain.Users.ValueObjects;
using MzadZone.Domain.Payments;

namespace MazadZone.Application.Services;
public interface IAuctionQueries : IScopedService
{
    Task<AuctionDto?> GetAuctionByIdAsync(Guid auctionId, CancellationToken ct);
    Task<PagedList<AuctionsListDto>> SearchAuctionsAsync(AuctionQueryParameters queryParameters, CancellationToken ct);
    Task<IReadOnlyList<AuctionBiddersDto>> GetActiveAuctionsWithBiddersBySellerIdAsync(UserId sellerId, CancellationToken ct);
    Task<IReadOnlyList<AffectedAuctionDto>> GetAuctionsByBidderIdAsync(UserId bidderId, CancellationToken ct);
    Task<Money> GetWinningBidAmountByOrderIdAsync(Guid orderId, CancellationToken ct);
    Task<Money> GetRemainingBalanceAsync(Payment payment, CancellationToken ct);
}

// public async Task<IEnumerable<AuctionBiddersDto>> GetBiddersForActiveAuctionsAsync(UserId sellerId, CancellationToken ct)
//     {
//         const string sql = @"
//             SELECT 
//                 a.Id AS AuctionId, 
//                 a.Title, 
//                 b.BidderId
//             FROM Auctions a
//             LEFT JOIN Bids b ON a.Id = b.AuctionId
//             WHERE a.SellerId = @SellerId 
//               AND a.Status = @ActiveStatus";

//         using var connection = connectionFactory.CreateConnection();
        
//         // We use a dictionary to group bidders under their specific AuctionId
//         var auctionDictionary = new Dictionary<Guid, AuctionBiddersDto>();

//         await connection.QueryAsync<dynamic>(sql, new 
//         { 
//             SellerId = sellerId.Value, 
//             ActiveStatus = (int)AuctionStatus.Active 
//         });

//         // Note: For multi-mapping with Dapper, we usually do this:
//         var result = await connection.QueryAsync<Guid, string, Guid?, (Guid Id, string Title, Guid? BidderId)>(
//             sql,
//             (id, title, bidderId) => (id, title, bidderId),
//             new { SellerId = sellerId.Value, ActiveStatus = 1 }, // Assuming 1 = Active
//             splitOn: "Title,BidderId"
//         );

//         return result
//             .GroupBy(x => new { x.Id, x.Title })
//             .Select(g => new AuctionBiddersDto(
//                 g.Key.Id,
//                 g.Key.Title,
//                 g.Where(x => x.BidderId.HasValue).Select(x => x.BidderId!.Value).ToList()
//             ));
//     }

// public async Task<List<AuctionNotificationData>> GetActiveAuctionsWithBiddersBySellerIdAsync(UserId sellerId, CancellationToken ct)
//     {
//         return await _context.Auctions
//             .Where(a => a.SellerId == sellerId && a.Status == AuctionStatus.Active)
//             .Select(a => new AuctionNotificationData(
//                 a.Id,
//                 // a.Title,
//                 a.Bids.Select(b => b.BidderId).Distinct().ToList()
//             ))
//             .ToListAsync(ct);
//     }
// public async Task<IEnumerable<AffectedAuctionDto>> GetAuctionsByBidderIdAsync(UserId bidderId, CancellationToken ct)
// {
//     const string sql = @"
//         SELECT a.Id, a.Title, a.SellerId, b.BidderId AS OtherBidderId
//         FROM Auctions a
//         JOIN Bids b ON a.Id = b.AuctionId
//         WHERE a.Status = 1 -- Active
//         AND a.Id IN (SELECT AuctionId FROM Bids WHERE BidderId = @BidderId)";

//     using var connection = _connectionFactory.CreateConnection();
//     // Grouping logic here to return one DTO per Auction with a List of OtherBidderIds
// }