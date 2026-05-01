using Microsoft.Extensions.Logging;
using MazadZone.Application.Common.Logging;
using MazadZone.Domain.Entities.Orders;
using MazadZone.Domain.Orders;

namespace MazadZone.Application.Features.Orders.Commands.CancelOrder;

public class CancelOrderHandler : ICommandHandler<CancelOrderCommand, Unit>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CancelOrderHandler> _logger;

    public CancelOrderHandler(
        IOrderRepository orderRepository, 
        IUnitOfWork unitOfWork,
        ILogger<CancelOrderHandler> logger)
    {
        _orderRepository = orderRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(CancelOrderCommand request, CancellationToken ct)
    {
        // 1. Establish the zero-allocation correlation scope using .Value
        using var scope = _logger.BeginOrderScope(request.OrderId);

        _logger.LogCancelOrderAttempt(request.OrderId);

        var order = await _orderRepository.GetByIdAsync(request.OrderId, ct);

        if (order is null) 
        {
            _logger.LogOrderNotFound(request.OrderId);
            return OrderErrors.NotFound;
        }

        var cancellationResult = order.Cancel();
        
        if (cancellationResult.IsFailure) 
        {
            _logger.LogCancelOrderFailed(request.OrderId, cancellationResult.TopError.Message);
            return cancellationResult.TopError;
        }

        await _unitOfWork.SaveChangesAsync(ct);

        _logger.LogOrderCancelledSuccessfully(request.OrderId);

        return Unit.Value;
    }
}