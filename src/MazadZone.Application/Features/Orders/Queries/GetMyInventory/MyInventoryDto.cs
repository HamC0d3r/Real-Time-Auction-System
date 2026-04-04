using System.Collections.Generic;

namespace MazadZone.Application.Orders.Queries.DTOs;

public record MyInventoryDto(
    decimal TotalSales,
    int PendingOrdersCount,
    IReadOnlyList<OrderHistoryDto> RecentOrders);