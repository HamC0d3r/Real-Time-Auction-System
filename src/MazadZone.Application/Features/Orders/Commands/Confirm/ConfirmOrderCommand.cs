namespace MazadZone.Application.Features.Orders.Commands.Confirm;

public record ConfirmOrderCommand(OrderId OrderId) : ICommand<Unit>;