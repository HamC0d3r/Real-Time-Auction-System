using MazadZone.Application.Features.Orders.Queries.DTOs;
using MazadZone.Application.Services;

namespace MazadZone.Application.Features.Orders.Queries.GetOrderByWinningBid;

public class GetOrderByWinningBidQueryHandler
    : IQueryHandler<GetOrderByWinningBidQuery, OrderDetailsDto>
{
    private readonly IOrderQueries _orderQueries;
    private readonly ILogger<GetOrderByWinningBidQueryHandler> _logger;

    public GetOrderByWinningBidQueryHandler(IOrderQueries orderQueries, ILogger<GetOrderByWinningBidQueryHandler> logger)
    {
        _orderQueries = orderQueries;
        _logger = logger;
    }

    async Task<Result<OrderDetailsDto>> IRequestHandler<GetOrderByWinningBidQuery, Result<OrderDetailsDto>>.Handle(GetOrderByWinningBidQuery request, CancellationToken cancellationToken)
    {
        _logger.LogResolvingOrderByBid(request.WinningBidId.Value);
        var orderDto =  await _orderQueries.GetOrderByWinningBidAsync(request.WinningBidId, cancellationToken);
        if(orderDto is null)
        {
            _logger.LogOrderNotFoundForBid(request.WinningBidId.Value);

            return OrderErrors.NotFound;
        }

        return orderDto;

    }
}