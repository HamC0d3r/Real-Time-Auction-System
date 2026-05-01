using Microsoft.Extensions.Logging;
using MazadZone.Application.Common.Logging;
using MazadZone.Domain.Entities.Orders;
using MazadZone.Domain.Orders;
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
        _logger.LogCreateOrderAttempt(request.WinningBidId);

        var orderResult = CreateOrder(request);

        if (orderResult.IsFailure)
        {
            _logger.LogCreateOrderFailed(orderResult.TopError.Message);
            return orderResult.TopError;
        }

        await _orderRepository.AddAsync(orderResult.Value, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogOrderCreatedSuccessfully(orderResult.Value.Id);

        return orderResult.Value.Id;
    }
    private Result<Order> CreateOrder(CreateOrderCommand command)
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