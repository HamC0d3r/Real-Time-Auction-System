using MazadZone.Domain.Auctions;

namespace MazadZone.Application.Features.Auctions.Queries;

public sealed record AuctionsListDto(
    Guid Id,
    string imageUrl, //primary image url
    string ItemTitle,
    decimal CurrentBidAmount, // Refresh websocket connection to get real-time updates on current bid amount
    DateTime StartTime,
    DateTime EndTime,
    int Status, // Refresh websocket connection to get real-time updates on auction status (active/upcoming/ended)
    int BidsCount //Refresh websocket connection to get real-time updates on bid count and current bid amount
);
