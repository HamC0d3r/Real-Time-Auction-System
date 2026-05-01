namespace MazadZone.Application.Features.Orders.Queries.DTOs;

public record OrderSummaryDto(
    Guid Id,
    string Status,
    decimal TotalAmount,
    string Currency,
    DateTime CreatedAt,
    bool IsDisputable,
    bool HasActiveDispute,
    bool CanLeaveFeedback);
