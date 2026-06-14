namespace MazadZone.Application.Features.Orders.DTOs;

public readonly record struct OrderStatusUpdateDto
(Guid OrderId,
 string NewStatus,
 DateTime UpdatedAt);
