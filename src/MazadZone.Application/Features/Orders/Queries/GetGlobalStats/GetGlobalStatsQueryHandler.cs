using Microsoft.Extensions.Logging;
using MazadZone.Application.Features.Orders.Queries.DTOs;
using MazadZone.Application.Services;

namespace MazadZone.Application.Features.Orders.Queries.GetGlobalStats;

public class GetGlobalStatsQueryHandler
    : IQueryHandler<GetGlobalStatsQuery, AdminGlobalStatsDto>
{
    private readonly IOrderQueries _orderQueries;
    private readonly ILogger<GetGlobalStatsQueryHandler> _logger;

    public GetGlobalStatsQueryHandler(
        IOrderQueries orderQueries,
        ILogger<GetGlobalStatsQueryHandler> logger
    )
    {
        _orderQueries = orderQueries;
        _logger = logger;
    }

    public async Task<Result<AdminGlobalStatsDto>> Handle(GetGlobalStatsQuery request, CancellationToken cancellationToken)
    {
        _logger.LogCompilingGlobalStats();
        return await _orderQueries.GetGlobalStatsAsync(cancellationToken);

    }
}
