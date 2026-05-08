using MazadZone.Domain.Entities.Orders;
using MazadZone.Application.Features.Orders.Commands.CreateOrder;

namespace MazadZone.Application.Orders.CreateOrder;

public class CreateOrderHandler : ICommandHandler<CreateOrderCommand, OrderId>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreateOrderHandler> _logger;

    public CreateOrderHandler(
        IOrderRepository orderRepository, 
        IUnitOfWork unitOfWork,
        ILogger<CreateOrderHandler> logger)
    {
        _orderRepository = orderRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<OrderId>> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        CreateOrderLogs.LogAttempt(_logger, request.WinningBidId);


        var orderResult = _CreateOrder(request);

        if (orderResult.IsFailure)
        {
            CreateOrderLogs.LogDomainViolation(_logger, orderResult.TopError.Message);
            return orderResult.TopError;
        }

         _orderRepository.Add(orderResult.Value);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        CreateOrderLogs.LogSuccess(_logger, orderResult.Value.Id);

        return orderResult.Value.Id;
    }
    private Result<Order> _CreateOrder(CreateOrderCommand command)
    {
        return Order.Create(
            command.BidderId,
            command.WinningBidId,
            command.ReceiptAddressId,
            command.Amount,
            command.DepositCaptureTransactionId
        );
    }
}