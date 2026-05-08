using MazadZone.Domain.Entities.Orders;

namespace MazadZone.Application.Features.Orders.Commands.ResolveDispute;

public class ResolveDisputeHandler : ICommandHandler<ResolveDisputeCommand, Unit>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ResolveDisputeHandler> _logger;

    public ResolveDisputeHandler(
        IOrderRepository orderRepository, 
        IUnitOfWork unitOfWork,
        ILogger<ResolveDisputeHandler> logger)
    {
        _orderRepository = orderRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(ResolveDisputeCommand request, CancellationToken ct)
    {
        ResolveDisputeLogs.LogAttempt(_logger, request.OrderId, request.Resolution);

        var order = await _orderRepository.GetByIdAsync(request.OrderId.Value, ct);

        if (order is null) 
        {
            GlobalLogs.LogOrderNotFound(_logger, request.OrderId);
            return OrderErrors.NotFound;
        }

        var resolveDisputeResult = order.ResolveDispute(request.Resolution);
        
        if (resolveDisputeResult.IsFailure) 
        {
            ResolveDisputeLogs.LogDomainViolation(_logger, request.OrderId, resolveDisputeResult.TopError.Message);
            return resolveDisputeResult.TopError;
        }

        await _unitOfWork.SaveChangesAsync(ct);

        ResolveDisputeLogs.LogSuccess(_logger, request.OrderId);

        return Unit.Value;
    }
}