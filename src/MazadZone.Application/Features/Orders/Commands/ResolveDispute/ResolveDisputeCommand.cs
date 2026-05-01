namespace MazadZone.Application.Features.Orders.Commands.ResolveDispute;

public record ResolveDisputeCommand(OrderId OrderId, string Resolution) : ICommand<Unit>;