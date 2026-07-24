using Dapper;
using MazadZone.Application.Common.Interfaces;
using MazadZone.Features.DisputeTypes.Queries.GetAll;
using Polly;

namespace MazadZone.Infrastructure.Repositories.Queries;

public class DisputeTypeQueries : ResilientRepository ,IDisputeTypeQueries
{
    public DisputeTypeQueries(ISqlConnectionFactory sqlFactory, IAsyncPolicy resiliencePolicy)
        : base(sqlFactory, resiliencePolicy) { }

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

        return (await ExecuteResilientAsync(connection =>
            connection.QueryAsync<DisputeTypeDto>(sql))).AsList();
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

        return await ExecuteResilientAsync(connection =>
                  connection.QueryFirstOrDefaultAsync<DisputeTypeDto>(sql, new { DisputeTypeId = id.Value }));
        
    }
}