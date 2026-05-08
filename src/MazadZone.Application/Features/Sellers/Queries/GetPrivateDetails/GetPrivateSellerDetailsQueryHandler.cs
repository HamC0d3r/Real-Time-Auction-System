using MazadZone.Domain.Sellers;

namespace MazadZone.Application.Features.Sellers.Queries.GetPrivateDetails;

internal sealed class GetPrivateSellerDetailsQueryHandler 
    : IQueryHandler<GetPrivateSellerDetailsQuery, PrivateSellerDetailsResponse>
{
    private readonly ISellerQueries _sellerQueries;
    private readonly ILogger<GetPrivateSellerDetailsQueryHandler> _logger;

    public GetPrivateSellerDetailsQueryHandler(
        ISellerQueries sellerQueries,
        ILogger<GetPrivateSellerDetailsQueryHandler> logger
    )
    {
        _sellerQueries = sellerQueries;
        _logger = logger;
    }

    public async Task<Result<PrivateSellerDetailsResponse>> Handle(
        GetPrivateSellerDetailsQuery request, 
        CancellationToken cancellationToken)
    {
        var seller = await _sellerQueries.GetPrivateProfileAsync(request.SellerId, cancellationToken);

        if (seller is null)
        {
            GlobalLogs.LogSellerNotFound(_logger, request.SellerId);
            return SellerErrors.NotFound;
        }

        return seller;
    }
}