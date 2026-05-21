using MazadZone.Application.Features.Sellers.Queries.GetPrivateDetails;
using MazadZone.Application.Features.Sellers.Queries.GetPublicProfile;
using MazadZone.Application.Features.Sellers.Queries.GetUnverifiedSellers;
using MazadZone.Domain.Sellers;
using MazadZone.Domain.Shared.Interfaces;

namespace MazadZone.Application.Features.Sellers.Queries;

/// <summary>
/// Abstraction for Seller read models to isolate Dapper SQL from Handlers.
/// </summary>
public interface ISellerQueries : IScopedService
{
    Task<PublicSellerProfileResponse?> GetPublicProfileAsync(SellerId sellerId, CancellationToken cancellationToken);
    Task<PrivateSellerDetailsResponse?> GetPrivateProfileAsync(SellerId sellerId, CancellationToken cancellationToken);
    Task<IReadOnlyList<UnverifiedSellerSummaryResponse>?> GetUnverifiedSellersAsync(CancellationToken cancellationToken);
}