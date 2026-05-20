using MazadZone.Application.Common.Paging;

namespace MazadZone.Application.Features.Auctions.Queries;

public sealed record GetAuctionsQuery(
    int Page = 1, // default to first page
    int PageSize = 12, // default page size, can be adjusted as needed

    string? SearchTerm = null, // search by item title or description
    Guid? CategoryId = null, // filter by category
    Guid? SubCategoryId = null, // filter by subcategory

    CurrentBidAmountRange? CurrentBidAmount = null, // filter auctions with Current bid amount greater than or equal to this value
    string Status = "active", // filter by auction status: "active", "upcoming", "Ended", "all", 
    
    string SortBy = "CreationDate", // "CreationDate","StartTime", "EndTime", "StartAmount" , "CurrentBidAmount"
    string SortDirection = "desc" // "asc" or "desc" 
) : ICachedQuery<PagedList<AuctionsListDto>>
{
    public string CacheKey =>
        $"auctions:p={Page}:ps={PageSize}" +
        $":s={SearchTerm ?? "all"}" +
        $":cat={CategoryId?.ToString() ?? "all"}" +
        $":subcat={SubCategoryId?.ToString() ?? "all"}" +
        $":CurrentBidAmount={CurrentBidAmount?.ToString() ?? "any"}" +
        $":status={Status}" +
        $":sort={SortBy}:{SortDirection}";

    public string[] Tags => ["auctions"];

    public TimeSpan Expiration => TimeSpan.FromMinutes(2);
}