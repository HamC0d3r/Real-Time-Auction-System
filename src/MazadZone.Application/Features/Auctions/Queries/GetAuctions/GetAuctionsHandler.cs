using MazadZone.Application.Common.Paging;
using MazadZone.Application.Services;
using MazadZone.Domain.Auctions;
using Microsoft.Extensions.Caching.Memory;

namespace MazadZone.Application.Features.Auctions.Queries.GetAuctions;

public class GetAuctionsHandler
(IAuctionQueries _auctionQueries, ILogger<GetAuctionsHandler> _logger, IMemoryCache _cache)
: IQueryHandler<GetAuctionsQuery, PagedList<AuctionsListDto>>
{
    public async Task<Result<PagedList<AuctionsListDto>>> Handle(GetAuctionsQuery query, CancellationToken ct)
    {
        _logger.LogHandlingGetAuctions(query.SearchTerm, query.CategoryId?.Value, query.CurrentBidAmount, query.SortBy, query.SortDirection);

        if (_cache.TryGetValue<PagedList<AuctionsListDto>>(query.CacheKey, out var cached))
        {
            return Result.Success(cached!);
        }

        var queryParameters = new AuctionQueryParameters
        {
            Page = query.Page,
            PageSize = query.PageSize,
            SearchTerm = query.SearchTerm,
            CategoryId = query.CategoryId,
            CurrentBidAmount = query.CurrentBidAmount,
            Status = query.Status,
            SortBy = query.SortBy,
            SortDirection = query.SortDirection,
            ItemStatus = query.ItemStatus,
            Condition = query.Condition
        };

        var auctions = await _auctionQueries.SearchAuctionsAsync(queryParameters, ct);

        if (auctions == null)
        {
            _logger.LogNoAuctionsFound(query.SearchTerm, query.CategoryId?.Value, query.CurrentBidAmount, query.SortBy, query.SortDirection);
            return Result.Failure<PagedList<AuctionsListDto>>(AuctionErrors.NotFound);
        }

        _cache.Set(query.CacheKey, auctions, query.Expiration);

        _logger.SuccessRetrievedAuctions(query.SearchTerm, query.CategoryId?.Value, query.CurrentBidAmount, query.SortBy, query.SortDirection, auctions.TotalCount);
        return Result.Success(auctions);

    }
}