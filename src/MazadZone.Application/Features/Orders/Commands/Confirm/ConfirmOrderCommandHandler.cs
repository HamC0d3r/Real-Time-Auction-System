using MazadZone.Application.Features.Payments.Commands.CaptureRemainingAmount;
using MazadZone.Domain.Repositories;

namespace MazadZone.Application.Features.Orders.Commands.Confirm;

public class ConfirmOrderCommandHandler : ICommandHandler<ConfirmOrderCommand, Unit>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ConfirmOrderCommandHandler> _logger;
    private readonly ISender _sender;

    public ConfirmOrderCommandHandler(
        IOrderRepository orderRepository, 
        IUnitOfWork unitOfWork,
        ILogger<ConfirmOrderCommandHandler> logger,
        ISender sender
        )
    {
        _orderRepository = orderRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
        _sender = sender;
    }

    public async Task<Result<Unit>> Handle(ConfirmOrderCommand request, CancellationToken ct)
    {
        ConfirmOrderLogs.LogAttempt(_logger, request.OrderId);

        var order = await _orderRepository.GetByIdAsync(request.OrderId.Value, ct);

        if (order is null) 
        {
            ConfirmOrderLogs.LogOrderNotFound(_logger, request.OrderId);
            return OrderErrors.NotFound;
        }

        // Use the CaptureRemainingAmountCommand to handle payment logic
        var result = await _sender.Send(new CaptureRemainingAmountCommand(request.OrderId), ct);
        
        if (result.IsFailure)        {
            CaptureRemainingAmountLogs.LogFailure(_logger, request.OrderId, result.TopError.Message);
            return result.TopError;
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