using MazadZone.Domain.Auctions.Enums;

namespace MazadZone.Application.Features.Auctions.DTOs;

public sealed record BidDto(
    Guid BidderId,
    decimal Amount,
    int BidStatus, 
    DateTime Timestamp
);
