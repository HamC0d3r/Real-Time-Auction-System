namespace MazadZone.Application.Features.Orders.Queries.DTOs;

public record SellerOrderStatsDto(
    decimal TotalSales,
    decimal TotalRevenue,
    int PendingOrders,
    int ActiveDisputes,
    double AverageRating)
{
    public static SellerOrderStatsDto Empty => new(0m, 0m, 0, 0,0);

}
