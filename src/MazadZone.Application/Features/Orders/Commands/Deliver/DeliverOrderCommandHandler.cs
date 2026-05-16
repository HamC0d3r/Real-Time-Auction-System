using MazadZone.Domain.Repositories;

namespace MazadZone.Application.Features.Orders.Commands.DeliverOrder;

public class DeliverOrderCommandHandler : ICommandHandler<DeliverOrderCommand, Unit>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<DeliverOrderCommandHandler> _logger;

    public DeliverOrderCommandHandler(
        IOrderRepository orderRepository, 
        IUnitOfWork unitOfWork,
        ILogger<DeliverOrderCommandHandler> logger)
    {
        _orderRepository = orderRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(DeliverOrderCommand request, CancellationToken ct)
    {
        DeliverOrderLogs.LogAttempt(_logger, request.OrderId);

        var order = await _orderRepository.GetByIdAsync(request.OrderId.Value, ct);

        if (order is null) 
        {
            GlobalLogs.LogOrderNotFound(_logger, request.OrderId);
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