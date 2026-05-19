using MazadZone.Domain.Auctions;

namespace MazadZone.Application.Features.Sellers.Queries.GetPublicProfile;
public record PublicSellerProfileResponse(
    SellerId SellerId, 
    decimal Rating, 
    int ReviewsCount, 
    bool IsVerified,
    DateTime JoinedOnUtc);