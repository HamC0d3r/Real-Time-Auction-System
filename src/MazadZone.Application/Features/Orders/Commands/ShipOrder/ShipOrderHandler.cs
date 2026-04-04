using System.Threading;
using System.Threading.Tasks;
using MediatR;
using CSharpFunctionalExtensions;
using MazadZone.Domain.Entities.Orders;

namespace MazadZone.Application.Orders.ShipOrder;

public class ShipOrderHandler : IRequestHandler<ShipOrderCommand, Result>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ShipOrderHandler(IOrderRepository orderRepository, IUnitOfWork unitOfWork)
    {
        _orderRepository = orderRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(ShipOrderCommand request, CancellationToken cancellationToken)
    {
        var order = await _orderRepository.GetByIdAsync(new OrderId(request.OrderId), cancellationToken);

        if (order is null)
            return Result.Failure(OrderErrors.NotFound);

        return await Result.Success(order)
            .Ensure(o => o.CanShip(), OrderErrors.CannotShipped)
            .Tap(o => o.SetAsShipped())
            .Tap(async _ => await _unitOfWork.SaveChangesAsync(cancellationToken));
    }
}