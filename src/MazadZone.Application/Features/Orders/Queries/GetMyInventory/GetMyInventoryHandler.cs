using System.Threading;
using System.Threading.Tasks;
using MediatR;
using CSharpFunctionalExtensions;
using MazadZone.Domain.Entities.Orders;
using MazadZone.Application.Orders.Queries.DTOs;

namespace MazadZone.Application.Orders.Queries.GetMyInventory;

public class GetMyInventoryHandler : IRequestHandler<GetMyInventoryQuery, Result<MyInventoryDto>>
{
    private readonly IOrderRepository _orderRepository;

    public GetMyInventoryHandler(IOrderRepository orderRepository)
    {
        _orderRepository = orderRepository;
    }

    public async Task<Result<MyInventoryDto>> Handle(GetMyInventoryQuery request, CancellationToken cancellationToken)
    {
        var totalSalesTask = _orderRepository.GetTotalSalesBySellerAsync(request.UserId, cancellationToken);
        var pendingCountTask = _orderRepository.GetPendingOrdersCountAsync(cancellationToken);
        var historyTask = _orderRepository.GetOrderHistoryAsync(request.UserId, request.Page, request.PageSize, cancellationToken);

        await Task.WhenAll(totalSalesTask, pendingCountTask, historyTask);
        return Result.Success(new MyInventoryDto(totalSalesTask.Result, pendingCountTask.Result, historyTask.Result));
    }
}