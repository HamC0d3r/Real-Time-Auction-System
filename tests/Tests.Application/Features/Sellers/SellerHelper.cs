using MazadZone.Domain.Auctions;
using MazadZone.Domain.Sellers;

namespace Tests.Application.Features.Sellers;

public static class SellerHelper
{
    /// <summary>
    /// Centralizes the creation of a valid dummy Seller for testing purposes.
    /// </summary>
    public static Seller CreateValidSeller()
    {
        return Seller.BecomeSeller(
            BidderId.New(), 
            "Test Bank Account", 
            "Test National Id"
        ).Value; 
    }
}