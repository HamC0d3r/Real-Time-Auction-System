namespace MazadZone.Application.Features.Orders.Queries.GetGlobalStats;

internal static partial class GetGlobalStatsLog
{
    [LoggerMessage(
        EventId = MazadLogEvents.Orders.CompileGlobalStats, 
        Level = LogLevel.Information, 
        Message = "Compiling global platform statistics.")]
    public static partial void LogCompiling(ILogger logger);
}
