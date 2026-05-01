using MazadZone.Application.Features.Orders.Queries.DTOs;

namespace MazadZone.Application.Features.Orders.Queries.GetGlobalStats;

public record GetGlobalStatsQuery() : IQuery<AdminGlobalStatsDto>;
