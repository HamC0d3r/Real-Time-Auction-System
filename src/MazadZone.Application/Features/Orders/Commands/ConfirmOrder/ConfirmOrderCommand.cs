using MazadZone.Domain.Orders;

namespace MazadZone.Application.Features.Orders.Commands.ConfirmOrder;

public record ConfirmOrderCommand(OrderId OrderId) : ICommand<Unit>;