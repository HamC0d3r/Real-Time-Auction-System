using System.Threading;
using System.Threading.Tasks;
using MediatR;
using CSharpFunctionalExtensions;
using MazadZone.Domain.Entities.Orders;

namespace MazadZone.Application.Orders.OpenDispute;

public class OpenDisputeHandler : IRequestHandler<OpenDisputeCommand, Result>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUnitOfWork _unitOfWork;

    public OpenDisputeHandler(IOrderRepository orderRepository, IUnitOfWork unitOfWork)
    {
        _orderRepository = orderRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(OpenDisputeCommand request, CancellationToken cancellationToken)
    {
        var order = await _orderRepository.GetByIdAsync(new OrderId(request.OrderId), cancellationToken);

        if (order is null)
            return Result.Failure(OrderErrors.NotFound);

        return await Result.Success(order)
            .Ensure(o => o.CanOpenDispute(), OrderErrors.CannotOpenDispute)
            .Tap(o => o.OpenDispute(request.Reason))
            .Tap(async _ => await _unitOfWork.SaveChangesAsync(cancellationToken));
    }
}