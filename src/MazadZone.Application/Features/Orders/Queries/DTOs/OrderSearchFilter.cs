namespace MazadZone.Application.Features.Orders.Queries.DTOs;

public record OrderSearchFilter(
    Guid? UserId,
    string? Status,
    int PageSize = 10,
    int PageNumber = 1);