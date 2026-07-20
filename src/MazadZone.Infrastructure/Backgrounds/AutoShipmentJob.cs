using Dapper;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Quartz;
using MazadZone.Application.Features.Orders.Commands.ShipOrder;
using MazadZone.Domain.Orders;
using MazadZone.Application.Common.Interfaces;

namespace MazadZone.Infrastructure.BackgroundJobs;

[DisallowConcurrentExecution]
public class AutoShipmentJob : IJob
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<AutoShipmentJob> _logger;

    public AutoShipmentJob(IServiceScopeFactory scopeFactory, ILogger<AutoShipmentJob> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    public async Task Execute(IJobExecutionContext context)
    {
        _logger.LogInformation("Auto-Shipment Job started.");

        // Quartz jobs are singletons/transient, so we MUST create a scope to resolve scoped services like DbContext and ISender
        using var scope = _scopeFactory.CreateScope();
        var sender = scope.ServiceProvider.GetRequiredService<ISender>();
        var sqlConnectionFactory = scope.ServiceProvider.GetRequiredService<ISqlConnectionFactory>();

        // 1. Fetch a batch of Confirmed orders using high-performance Dapper
        const int batchSize = 50;
        const string sql = @"
            SELECT ""Id"" 
            FROM ""Orders"" 
            WHERE Status = @Status
            LIMIT @BatchSize;";

        using var connection = sqlConnectionFactory.CreateConnection();
        var orderIds = await connection.QueryAsync<Guid>(sql, new 
        { 
            BatchSize = batchSize, 
            Status = (int)OrderStatus.Confirmed 
        });

        // 2. Process each order independently
        foreach (var orderId in orderIds)
        {
            try
            {
                var result = await sender.Send(new ShipOrderCommand(OrderId.From(orderId)), context.CancellationToken);
                
                if (result.IsFailure)
                {
                    _logger.LogWarning("Auto-Shipment failed for Order {OrderId}: {Error}", orderId, result.TopError.Message);
                }
            }
            catch (Exception ex)
            {
                // Isolate exceptions so one bad order doesn't crash the entire batch
                _logger.LogError(ex, "Critical exception during auto-shipment for Order {OrderId}", orderId);
            }
        }

        _logger.LogInformation("Auto-Shipment Job completed.");
    }
}