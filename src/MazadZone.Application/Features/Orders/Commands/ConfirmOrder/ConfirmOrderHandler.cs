using MazadZone.Domain.Entities.Orders;

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
        ConfirmOrderLogs.LogAttempt(_logger, request.OrderId);

        var order = await _orderRepository.GetByIdAsync(request.OrderId.Value, ct);

        if (order is null) 
        {
            GlobalLogs.LogOrderNotFound(_logger, request.OrderId);
            return OrderErrors.NotFound;
        }

        var confirmationResult = order.Confirm();
        
        if(confirmationResult.IsFailure) 
        {
            ConfirmOrderLogs.LogDomainViolation(_logger, request.OrderId, confirmationResult.TopError.Message);
            return confirmationResult.TopError;
        }

        await _unitOfWork.SaveChangesAsync(ct);

        ConfirmOrderLogs.LogSuccess(_logger, request.OrderId);

        return Unit.Value;
    }
}