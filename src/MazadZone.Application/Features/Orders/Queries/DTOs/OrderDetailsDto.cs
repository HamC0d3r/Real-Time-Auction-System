namespace MazadZone.Application.Features.Orders.Queries.DTOs;

public record OrderDetailsDto(
    Guid Id,
    decimal TotalAmount,
    string Currency,
    Guid BidderId,
    Guid WinningBidId,
    Guid AuctionId,
    string Status,
    bool HasActiveDispute,
    bool IsDisputable,
    bool CanLeaveFeedback);
