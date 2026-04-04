using MazadZone.Domain.Orders;

namespace MazadZone.Application.Features.Orders.Commands.CancelOrder;

public record CancelOrderCommand(OrderId OrderId) : ICommand<Unit>;