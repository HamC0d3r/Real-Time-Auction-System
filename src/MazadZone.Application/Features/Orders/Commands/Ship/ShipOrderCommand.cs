namespace MazadZone.Application.Features.Orders.Commands.ShipOrder;

public record ShipOrderCommand(OrderId OrderId) : ICommand<Unit>;