using MazadZone.Application.Common.Paging;
using MazadZone.Application.Features.Auctions.DTOs;
using MazadZone.Application.Features.Auctions.Queries;
using MazadZone.Application.Features.Users.Commands.Ban.Models;
using MazadZone.Application.Features.Users.DTOs;
using MazadZone.Application.Services;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Auctions.Enums;
using MazadZone.Domain.Orders;
using MazadZone.Domain.Users.ValueObjects;
using MazadZone.Domain.ValueObjects;
using MazadZone.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using MzadZone.Domain.Payments;


public partial class AuctionQueries (
    AppDbContext _context
): IAuctionQueries
{
    public async Task<IReadOnlyList<AuctionBiddersDto>> GetActiveAuctionsWithBiddersBySellerIdAsync(UserId sellerId, CancellationToken ct)
    {
        var auctions = _context.Auctions
            .AsNoTracking()
            .Where(a => a.SellerId.Equals(sellerId) && a.Status == AuctionStatus.Active)
            .Select(a => new AuctionBiddersDto(
                a.Id.Value,
                a.Item.Title,
                a.Bids.Select(b => b.BidderId.Value).ToList()
            ));
        


        return await auctions.ToListAsync(ct);
    }

    public async Task<AuctionDto?> GetAuctionByIdAsync(Guid auctionId, CancellationToken ct)
    {
        var auction = await _context.Auctions
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id.Equals(auctionId), ct);

        if (auction == null) return null;

        // 
        var sellerUserInfo = _context.Users.AsNoTracking()
            .Where(s => s.Id.Value == auction.SellerId.Value)
            .Select(s => new 
            { 
                FullName = s.FullName.FirstName + " " + s.FullName.LastName, 
                Email = s.Email.Value 
            })
            .FirstOrDefault();

        var SellerName = sellerUserInfo.FullName;
        var SellerEmail = sellerUserInfo.Email;

        var SellerRatingAndReviewCount = await _context.Sellers.AsNoTracking()
            .Where(s => s.Id.Equals(auction.SellerId.Value))
            .Select(s => new { s.Rating, s.ReviewsCount }).FirstOrDefaultAsync();


        var bids = auction.Bids
            .Select(b => new BidDto(
                b.BidderId.Value,
                b.Amount.Amount,
                (int)b.Status,
                b.PlacedAtUtc
            ))
            .ToList();

        return new AuctionDto(
            auction.Id.Value,
            auction.Item.Title,
            auction.Item.Description,
            auction.Item.Images.Select(img => img.Path).ToList(),
            SellerName,
            SellerEmail,
            SellerRatingAndReviewCount.Rating,
            SellerRatingAndReviewCount.ReviewsCount,
            auction.StartBidAmount.Amount,
            auction.MinBidAmount.Amount,
            auction.CurrentHighestBidAmount.Amount,
            auction.StartTime,
            auction.EndTime,
            (int)auction.Status,
            bids
        );
    }

    public async Task<IReadOnlyList<AffectedAuctionDto>> GetAuctionsByBidderIdAsync(UserId bidderId, CancellationToken ct)
    {
        var rawAuctions = await _context.Auctions
            .AsNoTracking()
            .Where(a => a.Bids.Any(b => b.BidderId == bidderId.Value))
            .Select(a => new 
            {
                Id = a.Id.Value,
                Title = a.Item.Title,
                SellerId = a.SellerId.Value,

                BidderIds = a.Bids.Select(b => b.BidderId.Value) 
            })
            .ToListAsync(ct);


        return rawAuctions.Select(a => new AffectedAuctionDto
        (
            a.Id,
            a.Title,
            a.SellerId,
            // get anothers bidders with out current bidder
            a.BidderIds.Where(id => id != bidderId.Value).ToHashSet() 
        )).ToList();
    
    }

    public async Task<Money> GetWinningBidAmountByOrderIdAsync(Guid orderId, CancellationToken ct)
    {
        return await _context.Orders
            .AsNoTracking()
            .Where(o => o.Id.Equals(orderId))
            .Select(o => o.TotalAmount).FirstOrDefaultAsync();
        
    }

    public async Task<PagedList<AuctionsListDto>> SearchAuctionsAsync(AuctionQueryParameters parameters, CancellationToken ct)
    {
        var query = _context.Auctions.AsNoTracking().AsQueryable();

        if (!string.IsNullOrEmpty(parameters.SearchTerm))
        {
            query = query.Where(a => EF.Functions.Like(a.Item.Title, $"%{parameters.SearchTerm}%") || 
                                    EF.Functions.Like(a.Item.Description, $"%{parameters.SearchTerm}%"));
        }

        if (parameters.CategoryId.HasValue)
        {
            query = query.Where(a => a.Item.CategoryId == parameters.CategoryId.Value);
        }

        if (parameters.SubCategoryId.HasValue)
        {
            query = query.Where(a => a.Item.CategoryId == parameters.SubCategoryId.Value);
        }

        if (!string.IsNullOrEmpty(parameters.Status) && 
            Enum.TryParse<AuctionStatus>(parameters.Status, true, out var status))
        {
            query = query.Where(a => a.Status == status);
        }

        if (parameters.CurrentBidAmount != null)
        {
            query = from a in query
                    let currentPrice = a.Bids.Where(b => b.Status == BidStatus.Leading)
                                            .Select(b => (decimal?)b.Amount.Amount)
                                            .FirstOrDefault()
                    where (!parameters.CurrentBidAmount.Min.HasValue || currentPrice >= parameters.CurrentBidAmount.Min.Value)
                    && (!parameters.CurrentBidAmount.Max.HasValue || currentPrice <= parameters.CurrentBidAmount.Max.Value)
                    select a;
        }

        var isAsc = string.Equals(parameters.SortDirection, "asc", StringComparison.OrdinalIgnoreCase);

        query = parameters.SortBy switch
        {
            "StartTime" => isAsc ? query.OrderBy(a => a.StartTime) : query.OrderByDescending(a => a.StartTime),
            "EndTime" => isAsc ? query.OrderBy(a => a.EndTime) : query.OrderByDescending(a => a.EndTime),
            "CurrentBidAmount" => isAsc 
                ? query.OrderBy(a => a.Bids.Where(b => b.Status == BidStatus.Leading).Select(b => b.Amount.Amount).FirstOrDefault()) 
                : query.OrderByDescending(a => a.Bids.Where(b => b.Status == BidStatus.Leading).Select(b => b.Amount.Amount).FirstOrDefault()),
            _ => isAsc ? query.OrderBy(a => a.CreatedOnUtc) : query.OrderByDescending(a => a.CreatedOnUtc)
        };

        var totalCount = await query.CountAsync(ct);

    var items = await query
        .Skip((parameters.Page - 1) * parameters.PageSize)
        .Take(parameters.PageSize)
        .Select(a => new AuctionsListDto(
            a.Id.Value, 
            
            a.Item.Images
                .Where(img => img.isMain)
                .Select(img => img.Path)
                .FirstOrDefault() ?? string.Empty,

            a.Item.Title, 
            
            a.Bids
                .Where(b => b.Status == BidStatus.Leading)
                .Select(b => b.Amount.Amount)
                .FirstOrDefault(),
                
            a.StartTime, 
            a.EndTime,   
            (int)a.Status,    
            a.Bids.Count() 
        )) 
        .ToListAsync(ct);

        return new PagedList<AuctionsListDto>(items, parameters.Page, parameters.PageSize, totalCount);
    }
}