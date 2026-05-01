using MazadZone.Application.Common.Logging;
using MazadZone.Application.Features.Orders.Queries.DTOs;
using MazadZone.Application.Services;
using Microsoft.Extensions.Logging;

namespace MazadZone.Application.Features.Orders.Queries.GetOrderDetails;

public class GetOrderDetailsQueryHandler 
    : IQueryHandler<GetOrderDetailsQuery, OrderDetailsDto>
{
    private readonly IOrderQueries _orderQueries;
    private readonly ILogger<GetOrderDetailsQueryHandler> _logger;

    public GetOrderDetailsQueryHandler(
        IOrderQueries orderQueries,
        ILogger<GetOrderDetailsQueryHandler> logger
    )
    {
        _orderQueries = orderQueries;
        _logger = logger;
    }

    async Task<Result<OrderDetailsDto>> IRequestHandler<GetOrderDetailsQuery, Result<OrderDetailsDto>>.Handle(GetOrderDetailsQuery request, CancellationToken cancellationToken)
    {
        _logger.LogFetchingOrderDetails(request.OrderId.Value);

        var orderDetailsDto = await _orderQueries.GetOrderDetailsAsync(request.OrderId, cancellationToken);

        if (orderDetailsDto is null)
        {
            _logger.LogOrderNotFound(request.OrderId);
            return OrderErrors.NotFound;
        }

        return orderDetailsDto;
    }
}