using MazadZone.Domain.Entities.Orders;

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
        AddFeedbackLogs.LogAttempt(_logger,request.OrderId, request.Rating);

        var order = await _orderRepository.GetByIdAsync(request.OrderId.Value, ct);

        if (order is null) 
        {
            GlobalLogs.LogOrderNotFound(_logger, request.OrderId);
            return OrderErrors.NotFound;
        }

        var addFeedbackResult = order.AddFeedback(request.Rating, request.Comment);
        
        if (addFeedbackResult.IsFailure) 
        {
            AddFeedbackLogs.LogDomainViolation(_logger, request.OrderId, addFeedbackResult.TopError.Message);
            return addFeedbackResult.TopError;
        }

        await _unitOfWork.SaveChangesAsync(ct);

        AddFeedbackLogs.LogSuccess(_logger, request.OrderId);

        return Unit.Value;
    }
}