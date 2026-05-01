using Microsoft.Extensions.Logging;
using MazadZone.Application.Common.Logging;
using MazadZone.Domain.Entities.Orders;
using MazadZone.Domain.Orders;

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
        using var scope = _logger.BeginOrderScope(request.OrderId);

        _logger.LogShipOrderAttempt(request.OrderId);

        var order = await _orderRepository.GetByIdAsync(request.OrderId, ct);

        if (order is null) 
        {
            _logger.LogOrderNotFound(request.OrderId);
            return OrderErrors.NotFound;
        }

        var orderShippingResult = order.Ship();
        
        if (orderShippingResult.IsFailure) 
        {
            _logger.LogShipOrderFailed(request.OrderId, orderShippingResult.TopError.Message);
            return orderShippingResult.TopError;
        }

        await _unitOfWork.SaveChangesAsync(ct);

        _logger.LogOrderShippedSuccessfully(request.OrderId);

        return Unit.Value;
    }
}