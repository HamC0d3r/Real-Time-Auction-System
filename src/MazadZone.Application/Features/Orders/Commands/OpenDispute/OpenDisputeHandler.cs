using MazadZone.Application.Common.Logging;
using MazadZone.Domain.Entities.Orders;

namespace MazadZone.Application.Features.Orders.Commands.OpenDispute;

public class OpenDisputeHandler : ICommandHandler<OpenDisputeCommand, Unit>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<OpenDisputeHandler> _logger;

    public OpenDisputeHandler(
        IOrderRepository orderRepository, 
        IUnitOfWork unitOfWork,
        ILogger<OpenDisputeHandler> logger)
    {
        _orderRepository = orderRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(OpenDisputeCommand request, CancellationToken ct)
    {
        OpenDisputeLogs.LogAttempt(_logger, request.OrderId, request.Reason);

        var order = await _orderRepository.GetByIdAsync(request.OrderId.Value, ct);

        if (order is null) 
        {
            GlobalLogs.LogOrderNotFound(_logger, request.OrderId);
            _logger.LogOrderNotFound(request.OrderId);
            return OrderErrors.NotFound;
        }

        var disputeResult = order.OpenDispute(request.Reason);
        
        if (disputeResult.IsFailure) 
        {
            OpenDisputeLogs.LogDomainViolation(_logger, request.OrderId, disputeResult.TopError.Message);
            return disputeResult.TopError;
        }

        await _unitOfWork.SaveChangesAsync(ct);

        OpenDisputeLogs.LogSuccess(_logger, request.OrderId);

        return Unit.Value;
    }
}