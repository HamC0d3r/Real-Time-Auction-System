namespace MazadZone.Infrastructure.Configuration;

public sealed class OutboxOptions
{
    public const string SectionName = "Outbox";

    public int BatchSize { get; init; } = 20;
    public int IntervalInSeconds { get; init; } = 0;
    
    // Pro-tip: Add a max retries setting so failing messages don't loop forever!
    public int MaxRetries { get; init; } = 3; 
}