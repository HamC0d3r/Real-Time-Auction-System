using MazadZone.Domain.Orders;

namespace MazadZone.Application.Features.Orders.Commands.AddFeedback;

public record AddFeedbackCommand(OrderId OrderId, int Rating, string Comment) : ICommand<Unit>;