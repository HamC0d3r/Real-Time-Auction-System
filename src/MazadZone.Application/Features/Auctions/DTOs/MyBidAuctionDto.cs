namespace MazadZone.Application.Features.Auctions.DTOs;

public sealed record MyBidAuctionDto(
    Guid AuctionId,
    string ImageUrl,
    string ItemTitle,
    decimal YourBidAmount,
    decimal CurrentBidAmount,
    string AuctionStatus,
    string YourBidStatus,
    DateTime StartTime,
    DateTime EndTime,
    int BidsCount
);
