using MazadZone.Domain.Entities.Orders;
using MazadZone.Domain.Orders;
using MazadZone.Application.Features.Orders.Commands.CreateOrder;

namespace MazadZone.Application.Orders.CreateOrder;

public class CreateOrderHandler : ICommandHandler<CreateOrderCommand, OrderId>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateOrderHandler(IOrderRepository orderRepository, IUnitOfWork unitOfWork)
    {
        _orderRepository = orderRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<OrderId>> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        var orderResult = CreateOrder(request);
        if (orderResult.IsFailure) return orderResult.TopError;

        await _orderRepository.AddAsync(orderResult.Value, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return orderResult.Value.Id;
    }

    private Result<Order> CreateOrder(CreateOrderCommand command)
    {
        return  Order.Create(
            command.BidderId,
            command.WinningBidId,
            command.ReceiptAddressId,
            command.Amount,
            command.DepositCaptureTransactionId
        );
    }

    
}