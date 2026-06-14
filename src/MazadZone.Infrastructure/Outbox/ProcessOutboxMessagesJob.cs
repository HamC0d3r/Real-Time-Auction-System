namespace MazadZone.Infrastructure.Outbox;

using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using MazadZone.Domain.Primitives;
using MazadZone.Infrastructure.Persistence;
using Newtonsoft.Json;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Polly;
using MazadZone.Infrastructure.Configuration;

public sealed class ProcessOutboxMessagesJob : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ProcessOutboxMessagesJob> _logger;
    private readonly OutboxOptions _options;
    private readonly IAsyncPolicy _retryPolicy;

    public ProcessOutboxMessagesJob(
        IServiceScopeFactory scopeFactory,
        ILogger<ProcessOutboxMessagesJob> logger,
        IAsyncPolicy retryPolicy,
        IOptions<OutboxOptions> options
        )
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
        _options = options.Value;
        _retryPolicy = retryPolicy;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessMessagesAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                // Graceful shutdown requested during message processing
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while processing outbox messages.");
            }

            try
            {
                // Wait 10 seconds before polling again. 
                // Adjust this based on how real-time you need emails/reactions to be.
                await Task.Delay(TimeSpan.FromSeconds(_options.IntervalInSeconds), stoppingToken);
            }
            catch (OperationCanceledException)
            {
                // Graceful shutdown requested during delay
                break;
            }
        }
    }

    private async Task ProcessMessagesAsync(CancellationToken stoppingToken)
{
    using var scope = _scopeFactory.CreateScope();

    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var publisher = scope.ServiceProvider.GetRequiredService<IPublisher>();

    var messages = await dbContext.Set<OutboxMessage>()
        .Where(m => m.ProcessedOnUtc == null)
        .Take(_options.BatchSize)
        .ToListAsync(stoppingToken);

    if (!messages.Any()) return;

    // OPTIMIZATION: Create the settings ONCE outside the loop to save memory/CPU
    var jsonSettings = new JsonSerializerSettings
    {
        TypeNameHandling = TypeNameHandling.All,
        Converters = new JsonConverter[]
        {
            new MoneyJsonConverter(),
            new CurrencyJsonConverter(),
            new NameJsonConverter(),
            new ImageJsonConverter(),
            new DescriptionJsonConverter(),
            new TitleJsonConverter(),
            new ReasonJsonConverter()
        }
    };

    foreach (var message in messages)
    {
        try
        {
            // 1. Safe Type Resolution across assemblies
            var type = Type.GetType(message.Type)
                ?? AppDomain.CurrentDomain.GetAssemblies()
                    .Select(a => a.GetType(message.Type))
                    .FirstOrDefault(t => t != null);

            if (type is null)
            {
                _logger.LogWarning("Could not resolve type: {MessageType} for message {MessageId}", message.Type, message.Id);
                continue;
            }

            // 2. Deserialize using the pre-configured settings
            var domainEvent = JsonConvert.DeserializeObject(message.Content, type, jsonSettings) as IDomainEvent;

            if (domainEvent is null)
            {
                _logger.LogWarning("Deserialized event is null for message {MessageId}", message.Id);
                continue;
            }

            // 3. Publish DIRECTLY to MediatR
            await _retryPolicy.ExecuteAsync(async () =>
                await publisher.Publish(domainEvent, stoppingToken));

            // 4. Mark as processed
            message.ProcessedOnUtc = DateTime.UtcNow;
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process outbox message {MessageId}", message.Id);
            message.Error = ex.Message;
            message.ProcessedOnUtc = DateTime.UtcNow; // Mark as processed to prevent queue deadlock
        }
    }

    try
    {
        await dbContext.SaveChangesAsync(stoppingToken);
    }
    catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
    {
        // Graceful shutdown requested during save changes
    }
}
}