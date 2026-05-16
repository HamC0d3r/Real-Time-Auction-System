using MazadZone.Domain.Repositories;

namespace MazadZone.Application.Features.Orders.Commands.CancelOrder;

public class CancelOrderCommandHandler : ICommandHandler<CancelOrderCommand, Unit>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CancelOrderCommandHandler> _logger;

    public CancelOrderCommandHandler(
        IOrderRepository orderRepository, 
        IUnitOfWork unitOfWork,
        ILogger<CancelOrderCommandHandler> logger)
    {
        _orderRepository = orderRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(CancelOrderCommand request, CancellationToken ct)
    {

        CancelOrderLogs.LogAttempt(_logger, request.OrderId);

        var order = await _orderRepository.GetByIdAsync(request.OrderId.Value, ct);

        if (order is null) 
        {
            GlobalLogs.LogOrderNotFound(_logger, request.OrderId);
            return OrderErrors.NotFound;
        }

        var cancellationResult = order.Cancel();
        
        if (cancellationResult.IsFailure) 
        {
            CancelOrderLogs.LogDomainViolation(_logger, request.OrderId, cancellationResult.TopError.Message);
            return cancellationResult.TopError;
        }

        await _unitOfWork.SaveChangesAsync(ct);

        CancelOrderLogs.LogSuccess(_logger, request.OrderId);

        return Unit.Value;
    }
}