using System.Threading;
using System.Threading.Tasks;
using MediatR;
using CSharpFunctionalExtensions;
using MazadZone.Domain.Entities.Orders;
using MazadZone.Application.Orders.Queries.DTOs;

namespace MazadZone.Application.Orders.Queries.GetOrderDetails;

public class GetOrderDetailsHandler : IRequestHandler<GetOrderDetailsQuery, Result<OrderDetailsDto>>
{
    private readonly IOrderRepository _orderRepository;

    public GetOrderDetailsHandler(IOrderRepository orderRepository)
    {
        _orderRepository = orderRepository;
    }

    public async Task<Result<OrderDetailsDto>> Handle(GetOrderDetailsQuery request, CancellationToken cancellationToken)
    {
        var orderDetails = await _orderRepository.GetOrderDetailsAsync(request.OrderId, cancellationToken);

        if (orderDetails is null)
            return Result.Failure<OrderDetailsDto>(OrderErrors.NotFound);

        return Result.Success(orderDetails);
    }
}