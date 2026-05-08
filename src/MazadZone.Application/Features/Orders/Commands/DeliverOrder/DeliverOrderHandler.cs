using MazadZone.Application.Common.Logging;
using MazadZone.Domain.Entities.Orders;

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

        DeliverOrderLogs.LogAttempt(_logger, request.OrderId);

        var order = await _orderRepository.GetByIdAsync(request.OrderId.Value, ct);

        if (order is null) 
        {
            GlobalLogs.LogOrderNotFound(_logger, request.OrderId);
            _logger.LogOrderNotFound(request.OrderId);
            return OrderErrors.NotFound;
        }

        var deliveryResult = order.Deliver();
        
        if (deliveryResult.IsFailure) 
        {
            DeliverOrderLogs.LogDomainViolation(_logger, request.OrderId, deliveryResult.TopError.Message);
            return deliveryResult.TopError;
        }

        await _unitOfWork.SaveChangesAsync(ct);

        DeliverOrderLogs.LogSuccess(_logger, request.OrderId);

        return Unit.Value;
    }
}