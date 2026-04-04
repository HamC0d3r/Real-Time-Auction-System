using System.Threading;
using System.Threading.Tasks;
using MediatR;
using CSharpFunctionalExtensions;
using MazadZone.Domain.Entities.Orders;

namespace MazadZone.Application.Orders.ResolveDispute;

public class ResolveDisputeHandler : IRequestHandler<ResolveDisputeCommand, Result>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ResolveDisputeHandler(IOrderRepository orderRepository, IUnitOfWork unitOfWork)
    {
        _orderRepository = orderRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(ResolveDisputeCommand request, CancellationToken cancellationToken)
    {
        var order = await _orderRepository.GetByIdAsync(new OrderId(request.OrderId), cancellationToken);

        if (order is null)
            return Result.Failure(OrderErrors.NotFound);

        return await Result.Success(order)
            .Ensure(o => o.CanResolveDispute(), OrderErrors.CannotResolveDispute)
            .Tap(o => o.ResolveDispute(request.Resolution))
            .Tap(async _ => await _unitOfWork.SaveChangesAsync(cancellationToken));
    }
}