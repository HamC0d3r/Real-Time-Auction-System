namespace MazadZone.Application.Features.Orders.Queries.DTOs;

// High-level aggregate for the Admin Dashboard
public record AdminGlobalStatsDto(
    decimal TotalSalesVolume,      // Sum of ALL orders (Gross Merchandise Value)
    int TotalOrders,               // Count of ALL orders
    
    decimal TotalRealizedRevenue,  // Sum of ONLY Delivered/Completed orders
    decimal AverageOrderValue,     // Average of ONLY Delivered/Completed orders
    
    decimal TotalPendingAmount,    // Sum of Pending orders
    int TotalPendingOrders,        // Count of Pending orders
    
    decimal TotalCanceledAmount,   // Sum of Canceled orders
    int TotalCanceledOrders,       // Count of Canceled orders
    
    int TotalActiveDisputes        // Count of unresolved disputes
)
{
    public static AdminGlobalStatsDto Empty => new(0, 0, 0, 0, 0, 0, 0, 0, 0);
}