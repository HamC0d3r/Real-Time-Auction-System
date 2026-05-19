namespace MazadZone.Application.Features.Sellers.Queries.GetUnverifiedSellers;

public sealed class GetUnverifiedSellersQueryHandler 
    : IQueryHandler<GetUnverifiedSellersQuery, IReadOnlyList<UnverifiedSellerSummaryResponse>>
{
    private readonly ISellerQueries _sellerQueries;

    public GetUnverifiedSellersQueryHandler(ISellerQueries sellerQueries)
    {
        _sellerQueries = sellerQueries;
    }

    public async Task<Result<IReadOnlyList<UnverifiedSellerSummaryResponse>>> Handle(
        GetUnverifiedSellersQuery request, 
        CancellationToken cancellationToken)
    {
        var sellers = await _sellerQueries.GetUnverifiedSellersAsync(cancellationToken);

        // We return an empty list if none found, not a failure Result.
        return Result.Success(sellers ?? new List<UnverifiedSellerSummaryResponse>());
    }
}