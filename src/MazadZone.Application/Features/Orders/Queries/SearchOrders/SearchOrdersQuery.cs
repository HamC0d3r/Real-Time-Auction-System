using MazadZone.Application.Common.Paging;
using MazadZone.Application.Features.Orders.Queries.DTOs;

namespace MazadZone.Application.Features.Orders.Queries.SearchOrders;

public record SearchOrdersQuery(OrderSearchFilter Filter) : IQuery<PagedList<OrderSummaryDto>>;
