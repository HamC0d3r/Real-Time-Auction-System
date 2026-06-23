using MazadZone.Application.Features.Dashboard.DTOs;
using MazadZone.Application.Services;

namespace MazadZone.Application.Features.Dashboard.Queries.GetStats;

public class GetDashboardStatsQueryHandler : IQueryHandler<GetDashboardStatsQuery, DashboardStatsDto>
{
    private readonly IDashboardQueries _dashboardQueries;

    public GetDashboardStatsQueryHandler(IDashboardQueries dashboardQueries)
    {
        _dashboardQueries = dashboardQueries;
    }

    public async Task<Result<DashboardStatsDto>> Handle(GetDashboardStatsQuery request, CancellationToken ct)
    {
        // Calculate the previous period dynamically (e.g., if requesting 7 days, previous is the 7 days before that)
        var duration = request.EndDate - request.StartDate;
        var prevStartDate = request.StartDate - duration;
        var prevEndDate = request.StartDate;
        var utcNow = DateTime.UtcNow;

        var (current, previous) = await _dashboardQueries.GetDashboardMetricsAsync(
            request.StartDate, request.EndDate, 
            prevStartDate, prevEndDate, 
            utcNow, ct);

        // Map and Calculate Percentages safely
        return new DashboardStatsDto(
            TotalAuctions: new StatMetricDto(current.TotalAuctions, CalculatePercentage(current.TotalAuctions, previous.TotalAuctions)),
            LiveAuctions: new StatMetricDto(current.LiveAuctions, CalculatePercentage(current.LiveAuctions, previous.LiveAuctions)),
            EndingWithin24h: new StatMetricDto(current.EndingWithin24h, CalculatePercentage(current.EndingWithin24h, previous.EndingWithin24h)),
            CompletedOrders: new StatMetricDto(current.CompletedOrders, CalculatePercentage(current.CompletedOrders, previous.CompletedOrders)),
            OpenDisputes: new StatMetricDto(current.OpenDisputes, CalculatePercentage(current.OpenDisputes, previous.OpenDisputes))
        );
    }

    // Helper method to calculate percentage change safely without DivideByZeroExceptions
    private static decimal CalculatePercentage(decimal current, decimal previous)
    {
        if (previous == 0)
        {
            return current > 0 ? 100.0m : 0.0m;
        }
        
        var change = ((current - previous) / previous) * 100;
        return Math.Round(change, 1); // Round to 1 decimal place like "+10.5%" in UI
    }
}