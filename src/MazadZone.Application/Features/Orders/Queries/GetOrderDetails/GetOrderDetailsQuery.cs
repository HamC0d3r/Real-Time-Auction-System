namespace MazadZone.Application.Orders.Queries.GetOrderDetails;

public record GetOrderDetailsQuery(Guid OrderId) : IRequest<Result<OrderDetailsDto>>;