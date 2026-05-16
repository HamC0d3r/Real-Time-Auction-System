namespace MazadZone.Infrastructure.Configuration;

public sealed class ResilienceOptions
{
    public const string SectionName = "Resilience";

    public int RetryCount { get; init; } = 3;
    public int BaseDelaySeconds { get; init; } = 2;
    public int MaxDelaySeconds { get; init; } = 10;

}