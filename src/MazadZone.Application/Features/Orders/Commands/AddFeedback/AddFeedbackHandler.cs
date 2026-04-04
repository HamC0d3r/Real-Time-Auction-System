using MazadZone.Domain.Entities.Orders;
using MazadZone.Domain.Orders;

namespace MazadZone.Application.Features.Orders.Commands.AddFeedback;

public class AddFeedbackHandler : ICommandHandler<AddFeedbackCommand, Unit>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUnitOfWork _unitOfWork;

    public AddFeedbackHandler(IOrderRepository orderRepository, IUnitOfWork unitOfWork)
    {
        _orderRepository = orderRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Unit>> Handle(AddFeedbackCommand request, CancellationToken ct)
    {
        var order = await _orderRepository.GetByIdAsync(request.OrderId, ct);

        if (order is null) return OrderErrors.NotFound;

        var addFeedbackResult = order.AddFeedback(request.Rating, request.Comment);
        if (addFeedbackResult.IsFailure) return addFeedbackResult.TopError;

        await _unitOfWork.SaveChangesAsync(ct);

        return Unit.Value;
    }
}