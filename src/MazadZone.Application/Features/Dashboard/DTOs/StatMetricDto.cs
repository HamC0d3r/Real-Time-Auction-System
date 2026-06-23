namespace MazadZone.Application.Features.Dashboard.DTOs;

public record StatMetricDto(
    decimal Value, 
    decimal PercentageChange
);

public record DashboardStatsDto(
    StatMetricDto TotalAuctions,
    StatMetricDto LiveAuctions,
    StatMetricDto EndingWithin24h,
    StatMetricDto CompletedOrders,
    StatMetricDto OpenDisputes
);