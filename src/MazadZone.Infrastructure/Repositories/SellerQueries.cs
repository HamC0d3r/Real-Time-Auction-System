using Dapper;
using MazadZone.Application.Common.Interfaces;
using MazadZone.Application.Features.Sellers.Queries;
using MazadZone.Application.Features.Sellers.Queries.GetPrivateDetails;
using MazadZone.Application.Features.Sellers.Queries.GetPublicProfile;
using MazadZone.Application.Features.Sellers.Queries.GetUnverifiedSellers;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Sellers;

namespace MazadZone.Infrastructure.Repositories;

public sealed class SellerQueries : ISellerQueries
{
    private readonly ISqlConnectionFactory _connectionFactory;

    public SellerQueries(ISqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<PublicSellerProfileResponse?> GetPublicProfileAsync(SellerId sellerId, CancellationToken cancellationToken)
    {
        using var connection = _connectionFactory.CreateConnection();

        const string sql = """
            SELECT 
                Id AS SellerId, 
                Rating, 
                ReviewsCount, 
                IsVerified, 
                CreatedOnUtc AS JoinedOnUtc
            FROM Sellers
            WHERE Id = @SellerId
            """;

        var command = new CommandDefinition(sql, new { SellerId = sellerId.Value }, cancellationToken: cancellationToken);
        return await connection.QuerySingleOrDefaultAsync<PublicSellerProfileResponse>(command);
    }

    public async Task<PrivateSellerDetailsResponse?> GetPrivateProfileAsync(SellerId sellerId, CancellationToken cancellationToken)
    {
        using var connection = _connectionFactory.CreateConnection();

        const string sql = """
            SELECT 
                Id AS SellerId, 
                BankAccountNumber, 
                TaxIdentificationNumber, 
                IsVerified, 
                Rating
            FROM Sellers
            WHERE Id = @SellerId
            """;

        var command = new CommandDefinition(sql, new { SellerId = sellerId.Value }, cancellationToken: cancellationToken);
        return await connection.QuerySingleOrDefaultAsync<PrivateSellerDetailsResponse>(command);
    }

    public async Task<IReadOnlyList<UnverifiedSellerSummaryResponse>?> GetUnverifiedSellersAsync(CancellationToken cancellationToken)
    {
        using var connection = _connectionFactory.CreateConnection();

        const string sql = """
            SELECT 
                Id AS SellerId, 
                BankAccountNumber, 
                TaxIdentificationNumber,
                CreatedOnUtc AS JoinedOnUtc
            FROM Sellers
            WHERE IsVerified = 0
            ORDER BY CreatedOnUtc ASC
            """;

        var command = new CommandDefinition(sql, cancellationToken: cancellationToken);
        var result = await connection.QueryAsync<UnverifiedSellerSummaryResponse>(command);
        
        return result.AsList();
    }

   
}