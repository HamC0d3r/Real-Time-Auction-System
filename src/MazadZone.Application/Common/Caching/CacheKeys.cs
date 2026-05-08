using MazadZone.Domain.Users.ValueObjects;

namespace MazadZone.Application.Common.Caching;

public static class CacheKeys
{
    public static class Users
    {
        // Key for a specific user's profile/details
        public static string Profile(UserId id) => $"user:{id.Value}:profile";
        
        // Key for a user's current permissions/claims
        public static string Permissions(UserId id) => $"user:{id.Value}:perms";
    }

    public static class Auctions
    {
        // Key for a specific auction's detail page
        public static string Detail(Guid auctionId) => $"auction:{auctionId}:detail";
        
        // Key for the "Latest Bids" list on an auction
        public static string ActiveBids(Guid auctionId) => $"auction:{auctionId}:bids";
    }
}