using Microsoft.Extensions.Logging;
using MazadZone.Application.Common.Logging;
using MazadZone.Domain.Entities.Orders;
using MazadZone.Domain.Orders;

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
        using var scope = _logger.BeginOrderScope(request.OrderId);

        _logger.LogOpenDisputeAttempt(request.OrderId, request.Reason);

        var order = await _orderRepository.GetByIdAsync(request.OrderId, ct);

        if (order is null) 
        {
            _logger.LogOrderNotFound(request.OrderId);
            return OrderErrors.NotFound;
        }

        var disputeResult = order.OpenDispute(request.Reason);
        
        if (disputeResult.IsFailure) 
        {
            _logger.LogOpenDisputeFailed(request.OrderId, disputeResult.TopError.Message);
            return disputeResult.TopError;
        }

        await _unitOfWork.SaveChangesAsync(ct);

        _logger.LogOrderDisputeOpenedSuccessfully(request.OrderId);

        return Unit.Value;
    }
}