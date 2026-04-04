using MazadZone.Domain.Entities.Orders;
using MazadZone.Domain.Orders;

namespace MazadZone.Application.Features.Orders.Commands.CancelOrder;

public class CancelOrderHandler : ICommandHandler<CancelOrderCommand, Unit>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CancelOrderHandler(IOrderRepository orderRepository, IUnitOfWork unitOfWork)
    {
        _orderRepository = orderRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Unit>> Handle(CancelOrderCommand request, CancellationToken ct)
    {
        var order = await _orderRepository.GetByIdAsync(request.OrderId, ct);

        if (order is null) return OrderErrors.NotFound;

        var cancellationResult = order.SetAsCancelled();
        if(cancellationResult.IsFailure) return cancellationResult.TopError;

        await _unitOfWork.SaveChangesAsync(ct);

        return Unit.Value;
    }
}