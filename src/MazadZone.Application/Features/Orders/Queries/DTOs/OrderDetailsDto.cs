namespace MazadZone.Application.Features.Orders.Queries.DTOs;

public record OrderDetailsDto(
    Guid Id,
    string Status,
    decimal TotalAmount,
    string Currency,
    Guid BidderId,
    Guid WinningBidId,
    bool HasActiveDispute,
    bool IsDisputable,
    bool CanLeaveFeedback);
