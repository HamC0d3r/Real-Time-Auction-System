using System.Data;
using Npgsql;
using MazadZone.Application.Common.Interfaces;

namespace MazadZone.Infrastructure.Persistence;

public sealed class SqlConnectionFactory(string _connectionString) : ISqlConnectionFactory
{
    public IDbConnection CreateConnection()
    {
        var connection = new NpgsqlConnection(_connectionString);
        // We do not open it here. We let Dapper or the caller open it when needed
        // to keep the connection lifecycle as short as possible.
        return connection; 
    }
}