namespace MazadZone.Infrastructure.Repositories;

using System;
using System.Threading.Tasks;
using MazadZone.Application.Common.Interfaces;
using MazadZone.Domain.Shared.Interfaces;
using Polly;

// Abstract means you can't instantiate it directly; it must be inherited.
public abstract class ResilientRepository : IScopedService
{
    protected readonly ISqlConnectionFactory _connectionFactory;
    private readonly IAsyncPolicy _resiliencePolicy;

    protected ResilientRepository(ISqlConnectionFactory connectionFactory, IAsyncPolicy resiliencePolicy)
    {
        _connectionFactory = connectionFactory;
        _resiliencePolicy = resiliencePolicy;
    }

    // This is the magic wrapper method
    protected async Task<T> ExecuteResilientAsync<T>(Func<System.Data.IDbConnection, Task<T>> action)
    {
        // 1. Create the connection ONCE
        using var connection = _connectionFactory.CreateConnection();

        // 2. Polly executes the action. If it fails, Polly will retry.
        // It passes the connection safely to your query.
        return await _resiliencePolicy.ExecuteAsync(async () => 
        {
            return await action(connection);
        });
    }
}