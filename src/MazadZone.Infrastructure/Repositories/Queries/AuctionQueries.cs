using MazadZone.Application.Common.Paging;
using MazadZone.Application.Features.Auctions.DTOs;
using MazadZone.Application.Features.Auctions.Queries;
using MazadZone.Application.Features.Bidders.Queries.GetMyBids;
using MazadZone.Application.Features.ChatAgent.DTOs;
using MazadZone.Application.Features.Users.Commands.Ban.Models;
using MazadZone.Application.Features.Users.DTOs;
using MazadZone.Application.Services;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Auctions.Enums;
using MazadZone.Domain.Categories;
using MazadZone.Domain.Orders;
using MazadZone.Domain.Users.ValueObjects;
using MazadZone.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using MzadZone.Domain.Payments;



public partial class AuctionQueries(
    AppDbContext _context
) : IAuctionQueries
{
    public async Task<IReadOnlyList<ActiveAuctionContextDto>> GetActiveAuctionContextAsync(CancellationToken ct)
    {
        // Fetch category names separately — Category.Name is a value object with a ValueConverter,
        // so EF.Property<string> can't be used inside a correlated subquery.
        var categoryLookup = (await _context.Categories
            .Select(c => new { c.Id, Name = EF.Property<string>(c, "Name") })
            .ToListAsync(ct))
            .ToDictionary(c => c.Id, c => c.Name);

        var rawAuctions = await _context.Auctions
            .Include(a => a.Item)
            .AsNoTracking()
            .Where(a => a.Status == AuctionStatus.Active)
            .Select(a => new
            {
                Id = a.Id.Value,
                Title = a.Item.Title,
                CurrentBidAmount = a.Bids
                    .Where(b => b.Status == BidStatus.Leading)
                    .Select(b => (decimal?)b.Amount.Amount)
                    .FirstOrDefault() ?? a.StartBidAmount.Amount,
                a.EndTime,
                a.Item.CategoryId
            })
            .ToListAsync(ct);

        return rawAuctions.Select(a => new ActiveAuctionContextDto(
            a.Id,
            a.Title,
            a.CurrentBidAmount,
            a.EndTime,
            categoryLookup.TryGetValue(a.CategoryId, out var name) ? name : "Uncategorized"
        )).ToList();
    }

    public async Task<IReadOnlyList<AuctionBiddersDto>> GetActiveAuctionsWithBiddersBySellerIdAsync(UserId sellerId, CancellationToken ct)
    {
        var auctions = _context.Auctions
            .AsNoTracking()
            .Where(a => a.SellerId == sellerId && a.Status == AuctionStatus.Active)
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
            .Include(a => a.Bids)
            .Include(a => a.Item)
            .ThenInclude(i => i.Images)
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == AuctionId.From(auctionId), ct);

        if (auction == null) return null;

        var sellerId = auction.SellerId;

        var sellerUserInfo = sellerId != null
            ? await _context.Users.AsNoTracking()
                .Where(s => s.Id == sellerId)
                .Select(s => new
                {
                    s.FullName.FirstName,
                    s.FullName.LastName,
                    Email = s.Email.Value
                })
                .FirstOrDefaultAsync(ct)
            : null;

        var sellerName = sellerUserInfo != null
            ? $"{sellerUserInfo.FirstName} {sellerUserInfo.LastName}".Trim()
            : "Unknown Seller";

        var sellerEmail = sellerUserInfo?.Email ?? "No Email";

        var sellerRatingAndReviewCount = sellerId != null
            ? await _context.Sellers.AsNoTracking()
                .Where(s => s.Id == sellerId)
                .Select(s => new { s.Rating, s.ReviewsCount })
                .FirstOrDefaultAsync(ct)
            : null;

        var rating = sellerRatingAndReviewCount?.Rating ?? 0;
        var reviews = sellerRatingAndReviewCount?.ReviewsCount ?? 0;

        var bidderUserIds = auction.Bids?.Select(b => b.BidderId).Where(id => id != null).Distinct().ToList() ?? new List<UserId>();

        var bidderNamesLookup = bidderUserIds.Any()
            ? await _context.Users.AsNoTracking()
                .Where(u => bidderUserIds.Contains(u.Id))
                .Select(u => new
                {
                    u.Id,
                    Name = u.FullName.FirstName + " " + u.FullName.LastName
                })
                .ToDictionaryAsync(u => u.Id, u => u.Name, ct)
            : new Dictionary<UserId, string>();

        var bids = auction.Bids != null
            ? auction.Bids.OrderByDescending(b => b.Amount.Amount)
                .Select(b => new BidDto(
                    b.BidderId.Value,
                    bidderNamesLookup.TryGetValue(b.BidderId, out var name) && !string.IsNullOrWhiteSpace(name) ? name : "Anonymous",
                    b.Amount.Amount,
                    (int)b.Status,
                    b.PlacedAtUtc
                ))
                .ToList()
            : new List<BidDto>();

        // Item info
        var itemTitle = auction.Item?.Title ?? "Untitled Auction";
        var itemDescription = auction.Item?.Description ?? string.Empty;

        var itemImages = auction.Item?.Images != null
            ? auction.Item.Images.Select(img => img.Path).ToList()
            : new List<string>();

        var startBid = auction.StartBidAmount.Amount;
        var minBid = auction.MinBidAmount.Amount;
        var currentBid = auction.CurrentHighestBidAmount.Amount;

        return new AuctionDto(
            auction.Id.Value,
            itemTitle,
            itemDescription,
            itemImages,
            sellerId.Value,
            sellerName,
            sellerEmail,
            rating,
            reviews,
            startBid,
            minBid,
            currentBid,
            auction.StartTime,
            auction.EndTime,
            auction.Status.ToString(),
            bids
        );
    }

    public async Task<IReadOnlyList<AuctionsListDto>?> GetSimilarAuctionsAsync(Guid auctionId, int limit, CancellationToken ct)
    {
        var stronglyTypedId = AuctionId.From(auctionId);
        var baseAuction = await _context.Auctions
            .Include(a => a.Item)
            .AsNoTracking()
            .Where(a => a.Id == stronglyTypedId)
            .Select(a => new { a.Item.CategoryId, a.Item.Title, a.Item.Description })
            .FirstOrDefaultAsync(ct);

        if (baseAuction == null)
        {
            return null;
        }

        var categoryId = baseAuction.CategoryId;
        var title = baseAuction.Title;

        var query = _context.Auctions
            .Include(a => a.Item)
            .ThenInclude(a => a.Images)
            .AsNoTracking()
            .Where(a => a.Id != stronglyTypedId && a.Status == AuctionStatus.Active)
            .Where(a => a.Item.CategoryId == categoryId ||
                        EF.Functions.Like(a.Item.Title, $"%{title}%") ||
                        EF.Functions.Like(a.Item.Description, $"%{title}%"));

        var rawSimilarAuctions = await query
            .OrderByDescending(a => a.Item.CategoryId == categoryId)
            .ThenByDescending(a => a.Bids.Where(b => b.Status == BidStatus.Leading)
                .Select(b => (decimal?)b.Amount.Amount)
                .FirstOrDefault() ?? a.StartBidAmount.Amount)
            .Take(limit)
            .Select(a => new
            {
                Id = a.Id.Value,
                ImageUrl = a.Item.Images.Where(img => img.IsMain).Select(img => img.Path).FirstOrDefault() ?? string.Empty,
                Title = a.Item.Title,
                ItemStatus = a.Item.Status,
                Condition = a.Item.Condition,
                CurrentBidAmount = a.Bids.Where(b => b.Status == BidStatus.Leading).Select(b => (decimal?)b.Amount.Amount).FirstOrDefault() ?? a.StartBidAmount.Amount,
                StartTime = a.StartTime,
                EndTime = a.EndTime,
                Status = a.Status,
                BidsCount = a.Bids.Count()
            })
            .ToListAsync(ct);

        var similarAuctions = rawSimilarAuctions.Select(a => new AuctionsListDto(
            a.Id,
            a.ImageUrl,
            a.Title,
            a.ItemStatus.ToString(),
            a.Condition.ToString(),
            a.CurrentBidAmount,
            a.StartTime,
            a.EndTime,
            a.Status.ToString(),
            a.BidsCount
        )).ToList();

        return similarAuctions;
    }

    public async Task<IReadOnlyList<AffectedAuctionDto>> GetAuctionsByBidderIdAsync(UserId bidderId, CancellationToken ct)
    {
        var rawAuctions = await _context.Auctions
            .AsNoTracking()
            .Where(a => a.Bids.Any(b => b.BidderId == bidderId))
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

    public async Task<PagedList<MyBidAuctionDto>> SearchMyBidsAsync(UserId bidderId, MyBidsQueryParameters parameters, CancellationToken ct)
    {
        var query = _context.Auctions
            .AsNoTracking()
            .Where(a => a.Bids.Any(b => b.BidderId == bidderId));

        if (!string.IsNullOrWhiteSpace(parameters.SearchTerm))
        {
            query = query.Where(a => EF.Functions.Like(a.Item.Title, $"%{parameters.SearchTerm}%") ||
                                     EF.Functions.Like(a.Item.Description, $"%{parameters.SearchTerm}%"));
        }

        if (parameters.CategoryId.HasValue)
        {
            var categoryId = CategoryId.From(parameters.CategoryId.Value);
            query = query.Where(a => a.Item.CategoryId == categoryId ||
                                     _context.Categories.Any(c => c.Id == a.Item.CategoryId && c.ParentCategoryId == categoryId));
        }

        var tab = parameters.Tab?.Trim().ToLowerInvariant() ?? "all";

        query = tab switch
        {
            "leading" => query.Where(a => a.Status != AuctionStatus.Ended && a.Bids.Any(b => b.BidderId == bidderId && b.Status == BidStatus.Leading)),
            "outbid" => query.Where(a => a.Status != AuctionStatus.Ended && a.Bids.Any(b => b.BidderId == bidderId && b.Status == BidStatus.Outbid)),
            "ended" => query.Where(a => a.Status == AuctionStatus.Ended),
            "lost" => query.Where(a => a.Status == AuctionStatus.Ended && a.Bids.Any(b => b.BidderId == bidderId && b.Status == BidStatus.Outbid)),
            "won" => query.Where(a => a.Status == AuctionStatus.Ended && a.Bids.Any(b => b.BidderId == bidderId && b.Status == BidStatus.Leading)),
            _ => query
        };

        var isAsc = string.Equals(parameters.SortDirection, "asc", StringComparison.OrdinalIgnoreCase);

        query = parameters.SortBy switch
        {
            "StartTime" => isAsc ? query.OrderBy(a => a.StartTime) : query.OrderByDescending(a => a.StartTime),
            "EndTime" => isAsc ? query.OrderBy(a => a.EndTime) : query.OrderByDescending(a => a.EndTime),
            "CurrentBidAmount" => isAsc
                ? query.OrderBy(a => a.Bids.Where(b => b.Status == BidStatus.Leading).Select(b => b.Amount.Amount).FirstOrDefault())
                : query.OrderByDescending(a => a.Bids.Where(b => b.Status == BidStatus.Leading).Select(b => b.Amount.Amount).FirstOrDefault()),
            "YourBidAmount" => isAsc
                ? query.OrderBy(a => a.Bids.Where(b => b.BidderId == bidderId).OrderByDescending(b => b.PlacedAtUtc).Select(b => b.Amount.Amount).FirstOrDefault())
                : query.OrderByDescending(a => a.Bids.Where(b => b.BidderId == bidderId).OrderByDescending(b => b.PlacedAtUtc).Select(b => b.Amount.Amount).FirstOrDefault()),
            _ => isAsc ? query.OrderBy(a => a.CreatedOnUtc) : query.OrderByDescending(a => a.CreatedOnUtc)
        };

        var totalCount = await query.CountAsync(ct);

        var queryResult = await query
            .Skip((parameters.Page - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .Select(a => new
            {
                Id = a.Id.Value,
                ImageUrl = a.Item.Images.Where(img => img.IsMain).Select(img => img.Path).FirstOrDefault() ?? string.Empty,
                Title = a.Item.Title,
                YourBidAmount = a.Bids.Where(b => b.BidderId == bidderId)
                    .OrderByDescending(b => b.PlacedAtUtc)
                    .Select(b => b.Amount.Amount)
                    .FirstOrDefault(),
                CurrentBidAmount = a.Bids.Where(b => b.Status == BidStatus.Leading).Select(b => b.Amount.Amount).FirstOrDefault(),
                Status = a.Status,
                YourBidStatus = a.Bids.Where(b => b.BidderId == bidderId)
                    .OrderByDescending(b => b.PlacedAtUtc)
                    .Select(b => (BidStatus?)b.Status)
                    .FirstOrDefault(),
                StartTime = a.StartTime,
                EndTime = a.EndTime,
                BidsCount = a.Bids.Count()
            })
            .ToListAsync(ct);

        var items = queryResult.Select(a => new MyBidAuctionDto(
            a.Id,
            a.ImageUrl,
            a.Title,
            a.YourBidAmount,
            a.CurrentBidAmount,
            a.Status.ToString(),
            a.YourBidStatus?.ToString() ?? string.Empty,
            a.StartTime,
            a.EndTime,
            a.BidsCount
        )).ToList();

        return new PagedList<MyBidAuctionDto>(items, parameters.Page, parameters.PageSize, totalCount);
    }

    public Task<Money> GetRemainingBalanceAsync(Payment payment, CancellationToken ct)
    {
        throw new NotImplementedException();
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
            var categoryId = parameters.CategoryId.Value;

            var targetIds = await GetDescendantCategoryIdsAsync(categoryId, ct);

            query = query.Where(a => targetIds.Contains(a.Item.CategoryId));
        }


        if (!string.IsNullOrEmpty(parameters.Status) &&
            Enum.TryParse<AuctionStatus>(parameters.Status, true, out var status))
        {
            var now = DateTime.UtcNow;
            if (status == AuctionStatus.Active)
            {
                query = query.Where(a => a.Status == AuctionStatus.Active && a.EndTime > now);
            }
            else if (status == AuctionStatus.Ended)
            {
                query = query.Where(a => a.Status == AuctionStatus.Ended || a.Status == AuctionStatus.Cancelled || a.EndTime <= now);
            }
            else
            {
                query = query.Where(a => a.Status == status);
            }
        }

        if (parameters.CurrentBidAmount != null)
        {
            var min = parameters.CurrentBidAmount.Min;
            var max = parameters.CurrentBidAmount.Max;


            if (min.HasValue || max.HasValue)
            {

                query = from a in query
                        let leadingBid = a.Bids.Where(b => b.Status == BidStatus.Leading)
                                               .Select(b => (decimal?)b.Amount.Amount)
                                               .FirstOrDefault()
                        let currentPrice = leadingBid ?? a.StartBidAmount.Amount
                        where (!min.HasValue || currentPrice >= min.Value)
                           && (!max.HasValue || currentPrice <= max.Value)
                        select a;
            }
        }

        var isAsc = string.Equals(parameters.SortDirection, "asc", StringComparison.OrdinalIgnoreCase);


        query = parameters.SortBy switch
        {
            "StartTime" => isAsc ? query.OrderBy(a => a.StartTime) : query.OrderByDescending(a => a.StartTime),
            "EndTime" => isAsc ? query.OrderBy(a => a.EndTime) : query.OrderByDescending(a => a.EndTime),
            "CurrentBidAmount" => isAsc
                ? query.OrderBy(a => a.Bids.Where(b => b.Status == BidStatus.Leading).Select(b => (decimal?)b.Amount.Amount).FirstOrDefault() ?? a.StartBidAmount.Amount)
                : query.OrderByDescending(a => a.Bids.Where(b => b.Status == BidStatus.Leading).Select(b => (decimal?)b.Amount.Amount).FirstOrDefault() ?? a.StartBidAmount.Amount),
            _ => isAsc ? query.OrderBy(a => a.CreatedOnUtc) : query.OrderByDescending(a => a.CreatedOnUtc)
        };

        if (!string.IsNullOrEmpty(parameters.ItemStatus) &&
        Enum.TryParse<ItemStatus>(parameters.ItemStatus, true, out var itemStatus))
        {


            query = query.Where(a => a.Item.Status == itemStatus);

        }

        if (!string.IsNullOrEmpty(parameters.Condition))
        {
            var conditionTerm = parameters.Condition.ToLowerInvariant();
            query = query.Where(a => EF.Functions.Like(
                EF.Property<string>(a.Item, "Condition"),
                $"%{conditionTerm}%"));
        }

        var totalCount = await query.CountAsync(ct);

        var queryResult = await query
            .Skip((parameters.Page - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .Select(a => new
            {
                Id = a.Id.Value,
                ImageUrl = a.Item.Images
                    .Where(img => img.IsMain)
                    .Select(img => img.Path)
                    .FirstOrDefault() ?? string.Empty,
                Title = a.Item.Title,
                ItemStatus = a.Item.Status,
                Condition = a.Item.Condition,
                CurrentBidAmount = a.Bids
                    .Where(b => b.Status == BidStatus.Leading)
                    .Select(b => (decimal?)b.Amount.Amount)
                    .FirstOrDefault() ?? a.StartBidAmount.Amount,
                StartTime = a.StartTime,
                EndTime = a.EndTime,
                Status = a.Status,
                BidsCount = a.Bids.Count()
            })
            .ToListAsync(ct);

        var items = queryResult.Select(a => new AuctionsListDto(
            a.Id,
            a.ImageUrl,
            a.Title,
            a.ItemStatus.ToString(),
            a.Condition.ToString(),
            a.CurrentBidAmount,
            a.StartTime,
            a.EndTime,
            a.Status.ToString(),
            a.BidsCount
        )).ToList();

        return new PagedList<AuctionsListDto>(items, parameters.Page, parameters.PageSize, totalCount);
    }

    private async Task<IReadOnlyList<CategoryId>> GetDescendantCategoryIdsAsync(CategoryId categoryId, CancellationToken ct)
    {
        var sql = $@"
            WITH RECURSIVE cat_tree AS (
                SELECT ""Id""
                FROM ""Categories""
                WHERE ""Id"" = {{0}}
                UNION ALL
                SELECT c.""Id""
                FROM ""Categories"" c
                INNER JOIN cat_tree ct ON c.""ParentCategoryId"" = ct.""Id""
            )
            SELECT ""Id"" FROM cat_tree";

        var ids = await _context.Database
            .SqlQueryRaw<Guid>(sql, categoryId.Value)
            .ToListAsync(ct);

        return ids.Select(CategoryId.From).ToList().AsReadOnly();
    }

}