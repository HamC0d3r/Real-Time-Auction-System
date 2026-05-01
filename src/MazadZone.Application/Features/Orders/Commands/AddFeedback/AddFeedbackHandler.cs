using Microsoft.Extensions.Logging;
using MazadZone.Application.Common.Logging;
using MazadZone.Domain.Entities.Orders;
using MazadZone.Domain.Orders;

namespace MazadZone.Application.Features.Orders.Commands.AddFeedback;

public class AddFeedbackHandler : ICommandHandler<AddFeedbackCommand, Unit>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AddFeedbackHandler> _logger;

    public AddFeedbackHandler(
        IOrderRepository orderRepository, 
        IUnitOfWork unitOfWork,
        ILogger<AddFeedbackHandler> logger)
    {
        _orderRepository = orderRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(AddFeedbackCommand request, CancellationToken ct)
    {
        using var scope = _logger.BeginOrderScope(request.OrderId);

        _logger.LogAddFeedbackAttempt(request.OrderId, request.Rating);

        var order = await _orderRepository.GetByIdAsync(request.OrderId, ct);

        if (order is null) 
        {
            _logger.LogOrderNotFound(request.OrderId);
            return OrderErrors.NotFound;
        }

        var addFeedbackResult = order.AddFeedback(request.Rating, request.Comment);
        
        if (addFeedbackResult.IsFailure) 
        {
            _logger.LogAddFeedbackFailed(request.OrderId, addFeedbackResult.TopError.Message);
            return addFeedbackResult.TopError;
        }

        await _unitOfWork.SaveChangesAsync(ct);

        _logger.LogFeedbackAddedSuccessfully(request.OrderId);

        return Unit.Value;
    }
}