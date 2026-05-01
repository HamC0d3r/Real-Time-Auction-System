using Microsoft.Extensions.Logging;

namespace MazadZone.Application.Features.Orders.Queries.GetGlobalStats;

public static partial class GetGlobalStatsLog
{
    [LoggerMessage(EventId = 90, Level = LogLevel.Information, Message = "Compiling global platform statistics.")]
    public static partial void LogCompilingGlobalStats(this ILogger logger);
}
