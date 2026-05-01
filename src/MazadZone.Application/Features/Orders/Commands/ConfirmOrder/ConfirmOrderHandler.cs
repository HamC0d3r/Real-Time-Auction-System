using Microsoft.Extensions.Logging;
using MazadZone.Application.Common.Logging;
using MazadZone.Domain.Entities.Orders;
using MazadZone.Domain.Orders;

namespace MazadZone.Application.Features.Orders.Commands.ConfirmOrder;

public class ConfirmOrderHandler : ICommandHandler<ConfirmOrderCommand, Unit>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ConfirmOrderHandler> _logger;

    public ConfirmOrderHandler(
        IOrderRepository orderRepository, 
        IUnitOfWork unitOfWork,
        ILogger<ConfirmOrderHandler> logger)
    {
        _orderRepository = orderRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(ConfirmOrderCommand request, CancellationToken ct)
    {
        using var scope = _logger.BeginOrderScope(request.OrderId);

        _logger.LogConfirmOrderAttempt(request.OrderId);

        var order = await _orderRepository.GetByIdAsync(request.OrderId, ct);

        if (order is null) 
        {
            _logger.LogOrderNotFound(request.OrderId);
            return OrderErrors.NotFound;
        }

        var confirmationResult = order.Confirm();
        
        if(confirmationResult.IsFailure) 
        {
            _logger.LogConfirmOrderFailed(request.OrderId, confirmationResult.TopError.Message);
            return confirmationResult.TopError;
        }

        await _unitOfWork.SaveChangesAsync(ct);

        _logger.LogOrderConfirmedSuccessfully(request.OrderId);

        return Unit.Value;
    }
}