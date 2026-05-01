using Microsoft.Extensions.Logging;
using MazadZone.Application.Common.Logging;
using MazadZone.Domain.Entities.Orders;
using MazadZone.Domain.Orders;

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
        using var scope = _logger.BeginOrderScope(request.OrderId);

        _logger.LogResolveDisputeAttempt(request.OrderId, request.Resolution);

        var order = await _orderRepository.GetByIdAsync(request.OrderId, ct);

        if (order is null) 
        {
            _logger.LogOrderNotFound(request.OrderId);
            return OrderErrors.NotFound;
        }

        var resolveDisputeResult = order.ResolveDispute(request.Resolution);
        
        if (resolveDisputeResult.IsFailure) 
        {
            _logger.LogResolveDisputeFailed(request.OrderId, resolveDisputeResult.TopError.Message);
            return resolveDisputeResult.TopError;
        }

        await _unitOfWork.SaveChangesAsync(ct);

        _logger.LogOrderDisputeResolvedSuccessfully(request.OrderId);

        return Unit.Value;
    }
}