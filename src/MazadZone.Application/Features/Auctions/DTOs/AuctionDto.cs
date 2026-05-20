using MazadZone.Application.Features.Auctions.Queries.Sellers;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Users;

namespace MazadZone.Application.Features.Auctions.DTOs;

public record AuctionDto(
    Guid Id,
    string ItemTitle,
    string ItemDescription,
    IReadOnlyList<string> ImageUrls,
    string SellerName,
    string SellerEmail,
    decimal SellerRating,
    int ReviewCount,
    decimal StartBidAmount,
    decimal MinBidAmount,
    decimal CurrentBidAmount,
    DateTime StartTime,
    DateTime EndTime,
    int AuctionStatus,
    IReadOnlyList<BidDto> Bids
    );

