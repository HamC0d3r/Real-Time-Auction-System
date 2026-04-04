namespace MazadZone.Application.Orders.Queries.DTOs;

public record OrderHistoryDto(
    Guid Id,
    decimal Amount,
    string Status,
    DateTime CreatedAt);