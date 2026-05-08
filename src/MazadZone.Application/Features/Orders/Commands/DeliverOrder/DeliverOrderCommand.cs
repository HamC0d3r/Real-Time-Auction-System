namespace MazadZone.Application.Features.Orders.Commands.DeliverOrder;

public record DeliverOrderCommand(OrderId OrderId) : ICommand<Unit>;