using Microsoft.Extensions.Logging;
using Dapper;
using MazadZone.Application.Common.Interfaces;
using MazadZone.Features.DisputeTypes.Queries.GetAll;
using Polly;

namespace MazadZone.Infrastructure.Repositories.Queries;

public class DisputeTypeQueries : ResilientRepository ,IDisputeTypeQueries
{
    public DisputeTypeQueries(ISqlConnectionFactory sqlFactory, IAsyncPolicy resiliencePolicy, ILogger<DisputeTypeQueries> logger)
        : base(sqlFactory, resiliencePolicy, logger) { }

    public async Task<IReadOnlyList<DisputeTypeDto>?> GetAllAsync(CancellationToken ct)
    {
        var sql = @"
        SELECT 
            ""Id"",
            ""Name"",
            ""Description"",
            ""IsActive""
        FROM ""DisputeTypes""
        WHERE ""IsActive"" = true
        ";

        return (await ExecuteResilientAsync(async (connection, ct) =>
            await connection.QueryAsync<DisputeTypeDto>(
                new CommandDefinition(sql, cancellationToken: ct)), ct)).AsList();
    }

    public async Task<DisputeTypeDto?> GetByIdAsync(DisputeTypeId id, CancellationToken ct)
    {
        var sql = @"
        SELECT 
         ""Id"",
         ""Name"",
         ""Description"",
         ""IsActive""
      FROM ""DisputeTypes""
      WHERE ""Id"" = @DisputeTypeId";

        return await ExecuteResilientAsync(async (connection, ct) =>
                  await connection.QueryFirstOrDefaultAsync<DisputeTypeDto>(
                      new CommandDefinition(sql, new { DisputeTypeId = id.Value }, cancellationToken: ct)), ct);
        
    }
}