using Microsoft.Extensions.Logging;
using MazadZone.Application.Common.Logging;
using MazadZone.Domain.Entities.Orders;
using MazadZone.Domain.Orders;

namespace MazadZone.Application.Features.Orders.Commands.DeliverOrder;

public class DeliverOrderHandler : ICommandHandler<DeliverOrderCommand, Unit>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<DeliverOrderHandler> _logger;

    public DeliverOrderHandler(
        IOrderRepository orderRepository, 
        IUnitOfWork unitOfWork,
        ILogger<DeliverOrderHandler> logger)
    {
        _orderRepository = orderRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(DeliverOrderCommand request, CancellationToken ct)
    {
        using var scope = _logger.BeginOrderScope(request.OrderId);

        _logger.LogDeliverOrderAttempt(request.OrderId);

        var order = await _orderRepository.GetByIdAsync(request.OrderId, ct);

        if (order is null) 
        {
            _logger.LogOrderNotFound(request.OrderId);
            return OrderErrors.NotFound;
        }

        var deliveryResult = order.Deliver();
        
        if (deliveryResult.IsFailure) 
        {
            _logger.LogDeliverOrderFailed(request.OrderId, deliveryResult.TopError.Message);
            return deliveryResult.TopError;
        }

        await _unitOfWork.SaveChangesAsync(ct);

        _logger.LogOrderDeliveredSuccessfully(request.OrderId);

        return Unit.Value;
    }
}