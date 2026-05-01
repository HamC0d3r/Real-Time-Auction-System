using MazadZone.Application.Common.Paging;
using MazadZone.Application.Features.Orders.Queries.DTOs;
using MazadZone.Application.Services;

namespace MazadZone.Application.Features.Orders.Queries.SearchOrders;

public class SearchOrdersQueryHandler 
    : IQueryHandler<SearchOrdersQuery, PagedList<OrderSummaryDto>>
{
    private readonly IOrderQueries _orderQueries;
    private readonly ILogger<SearchOrdersQueryHandler> _logger;

    public SearchOrdersQueryHandler(
        IOrderQueries orderQueries,
        ILogger<SearchOrdersQueryHandler> logger
    )
    {
        _orderQueries = orderQueries;
        _logger = logger;
    }

    async Task<Result<PagedList<OrderSummaryDto>>> IRequestHandler<SearchOrdersQuery, Result<PagedList<OrderSummaryDto>>>.Handle(SearchOrdersQuery request, CancellationToken cancellationToken)
    {
        _logger.LogSearchingOrders(request.Filter.PageNumber, request.Filter.PageSize);
        return await _orderQueries.SearchOrdersAsync(request.Filter, cancellationToken);
    }
}