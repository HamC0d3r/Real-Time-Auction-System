using MazadZone.Application.Features.Orders.Queries.DTOs;

namespace MazadZone.Application.Features.Orders.Queries.GetOrderDetails;

public record GetOrderDetailsQuery(OrderId OrderId) : IQuery<OrderDetailsDto>;