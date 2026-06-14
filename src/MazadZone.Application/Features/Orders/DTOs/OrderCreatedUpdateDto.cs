namespace MazadZone.Application.Features.Orders.DTOs;

public readonly record struct OrderCreatedUpdateDto
(Guid OrderId,
 Guid AuctionId,
 decimal FinalBid);
