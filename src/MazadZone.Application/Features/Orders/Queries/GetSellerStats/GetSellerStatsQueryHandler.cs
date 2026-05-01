using MazadZone.Application.Features.Orders.Queries.DTOs;
using MazadZone.Application.Services;

namespace MazadZone.Application.Features.Orders.Queries.GetSellerStats;

public class GetSellerStatsQueryHandler 
    : IQueryHandler<GetSellerStatsQuery, SellerOrderStatsDto>
{
    private readonly IOrderQueries _orderQueries;
    private readonly ILogger<GetSellerStatsQueryHandler> _logger;

    public GetSellerStatsQueryHandler(
        IOrderQueries orderQueries,
        ILogger<GetSellerStatsQueryHandler> logger
    )
    {
        _orderQueries = orderQueries;
        _logger = logger;
    }

    async Task<Result<SellerOrderStatsDto>> IRequestHandler<GetSellerStatsQuery, Result<SellerOrderStatsDto>>.Handle(GetSellerStatsQuery request, CancellationToken cancellationToken)
    {
        _logger.LogCalculatingSellerStats(request.SellerId.Value);
        return await _orderQueries.GetSellerStatsAsync(request.SellerId, cancellationToken);
    }
}