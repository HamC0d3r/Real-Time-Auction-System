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

    public async Task<Result<SellerOrderStatsDto>> Handle(GetSellerStatsQuery request, CancellationToken cancellationToken)
    {
        GetSellerStatsLog.LogCalculating(_logger, request.SellerId.Value);

        var result = await _orderQueries.GetSellerStatsAsync(request.SellerId, cancellationToken);
        if (result is null) return SellerOrderStatsDto.Empty;

        return result;
    }
}