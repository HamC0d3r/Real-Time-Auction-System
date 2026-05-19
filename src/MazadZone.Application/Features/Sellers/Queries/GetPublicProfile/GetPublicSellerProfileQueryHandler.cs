using MazadZone.Domain.Sellers;

namespace MazadZone.Application.Features.Sellers.Queries.GetPublicProfile;

public sealed class GetPublicSellerProfileQueryHandler 
    : IQueryHandler<GetPublicSellerProfileQuery, PublicSellerProfileResponse>
{
    private readonly ISellerQueries _sellerQueries;
    private readonly ILogger<GetPublicSellerProfileQueryHandler> _logger;

    public GetPublicSellerProfileQueryHandler(
        ISellerQueries sellerQueries, 
        ILogger<GetPublicSellerProfileQueryHandler> logger)
    {
        _sellerQueries = sellerQueries;
        _logger = logger;
    }

    public async Task<Result<PublicSellerProfileResponse>> Handle(
        GetPublicSellerProfileQuery request, 
        CancellationToken cancellationToken)
    {
        var seller = await _sellerQueries.GetPublicProfileAsync(request.SellerId, cancellationToken);

        if (seller is null)
        {
            GlobalLogs.LogSellerNotFound(_logger, request.SellerId);
            return SellerErrors.NotFound;
        }

        return seller;
    }
}