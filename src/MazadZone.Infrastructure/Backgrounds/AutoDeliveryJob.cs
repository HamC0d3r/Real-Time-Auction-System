using Dapper;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Quartz;
using MazadZone.Application.Features.Orders.Commands.DeliverOrder;
using MazadZone.Domain.Orders;
using MazadZone.Application.Common.Interfaces;

namespace MazadZone.Infrastructure.BackgroundJobs;

[DisallowConcurrentExecution]
public class AutoDeliveryJob : IJob
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<AutoDeliveryJob> _logger;

    public AutoDeliveryJob(IServiceScopeFactory scopeFactory, ILogger<AutoDeliveryJob> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    public async Task Execute(IJobExecutionContext context)
    {
        _logger.LogInformation("Auto-Delivery Job started.");

        using var scope = _scopeFactory.CreateScope();
        var sender = scope.ServiceProvider.GetRequiredService<ISender>();
        var sqlConnectionFactory = scope.ServiceProvider.GetRequiredService<ISqlConnectionFactory>();

        // 1. Fetch a batch of Shipped orders
        const int batchSize = 50;
        const string sql = @"
            SELECT ""Id"" 
            FROM ""Orders"" 
            WHERE ""Status"" = @Status
            LIMIT @BatchSize;";

        using var connection = sqlConnectionFactory.CreateConnection();
        var orderIds = await connection.QueryAsync<Guid>(sql, new 
        { 
            BatchSize = batchSize, 
            Status = (int)OrderStatus.Shipped 
        });

        // 2. Process each order independently
        foreach (var orderId in orderIds)
        {
            try
            {
                var result = await sender.Send(new DeliverOrderCommand(OrderId.From(orderId)), context.CancellationToken);
                
                if (result.IsFailure)
                {
                    _logger.LogWarning("Auto-Delivery failed for Order {OrderId}: {Error}", orderId, result.TopError.Message);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Critical exception during auto-delivery for Order {OrderId}", orderId);
            }
        }

        _logger.LogInformation("Auto-Delivery Job completed.");
    }
}