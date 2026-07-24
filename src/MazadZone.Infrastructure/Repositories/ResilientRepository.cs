namespace MazadZone.Infrastructure.Repositories;

using System;
using System.Data;
using System.Threading;
using System.Threading.Tasks;
using MazadZone.Application.Common.Interfaces;
using MazadZone.Domain.Shared.Interfaces;
using Microsoft.Extensions.Logging;
using Polly;

public abstract class ResilientRepository : IScopedService
{
    protected readonly ISqlConnectionFactory _connectionFactory;
    private readonly IAsyncPolicy _resiliencePolicy;
    private readonly ILogger _logger;

    protected ResilientRepository(
        ISqlConnectionFactory connectionFactory,
        IAsyncPolicy resiliencePolicy,
        ILogger logger)
    {
        _connectionFactory = connectionFactory;
        _resiliencePolicy = resiliencePolicy;
        _logger = logger;
    }

    protected async Task<T> ExecuteResilientAsync<T>(Func<IDbConnection, Task<T>> action)
    {
        return await _resiliencePolicy.ExecuteAsync(async () => 
        {
            using var connection = _connectionFactory.CreateConnection();
            await OpenConnectionAsync(connection);
            return await action(connection);
        });
    }

    protected async Task<T> ExecuteResilientAsync<T>(
        Func<IDbConnection, CancellationToken, Task<T>> action,
        CancellationToken ct)
    {
        // Do NOT pass ct to Polly.ExecuteAsync — Polly will throw TaskCanceledException
        // immediately if the token is already cancelled (e.g. client navigated away).
        // The CancellationToken is only forwarded to the inner Dapper CommandDefinition
        // so that Npgsql can cancel the in-flight query gracefully.
        return await _resiliencePolicy.ExecuteAsync(async () =>
        {
            using var connection = _connectionFactory.CreateConnection();
            await OpenConnectionAsync(connection, ct);
            return await action(connection, ct);
        });
    }

    /// <summary>
    /// Explicitly opens the connection asynchronously.
    /// Dapper's implicit open is synchronous and blocks the thread during 
    /// Neon PostgreSQL cold starts, causing thread-pool starvation and timeouts.
    /// </summary>
    private async Task OpenConnectionAsync(IDbConnection connection, CancellationToken ct = default)
    {
        if (connection.State == ConnectionState.Open)
            return;

        if (connection is System.Data.Common.DbConnection dbConnection)
        {
            _logger.LogDebug("Opening async connection to database...");
            await dbConnection.OpenAsync(ct);
            _logger.LogDebug("Database connection opened successfully.");
        }
        else
        {
            _logger.LogDebug("Opening sync connection to database (non-DbConnection)...");
            connection.Open();
        }
    }
}