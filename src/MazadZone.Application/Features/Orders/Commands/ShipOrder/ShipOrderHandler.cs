using MazadZone.Domain.Entities.Orders;

namespace MazadZone.Application.Features.Orders.Commands.ShipOrder;

public class ShipOrderHandler : ICommandHandler<ShipOrderCommand, Unit>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ShipOrderHandler> _logger;

    public ShipOrderHandler(
        IOrderRepository orderRepository, 
        IUnitOfWork unitOfWork,
        ILogger<ShipOrderHandler> logger)
    {
        _orderRepository = orderRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(ShipOrderCommand request, CancellationToken ct)
    {
        ShipOrderLogs.LogAttempt(_logger, request.OrderId);

        var order = await _orderRepository.GetByIdAsync(request.OrderId.Value, ct);

        if (order is null) 
        {
            GlobalLogs.LogOrderNotFound(_logger, request.OrderId);
            return OrderErrors.NotFound;
        }

        var orderShippingResult = order.Ship();
        
        if (orderShippingResult.IsFailure) 
        {
            ShipOrderLogs.LogDomainViolation(_logger, request.OrderId, orderShippingResult.TopError.Message);
            return orderShippingResult.TopError;
        }

        await _unitOfWork.SaveChangesAsync(ct);

        ShipOrderLogs.LogSuccess(_logger, request.OrderId);

        return Unit.Value;
    }
}