namespace MazadZone.Application.Features.Orders.Commands.OpenDispute;

public record OpenDisputeCommand(OrderId OrderId, string Reason) : ICommand<Unit>;