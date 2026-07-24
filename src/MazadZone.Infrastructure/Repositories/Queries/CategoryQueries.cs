namespace MazadZone.Infrastructure.Queries;

using Dapper;
using MazadZone.Application.Common.Interfaces;
using MazadZone.Application.Features.Categories.Queries;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Categories;
using MazadZone.Infrastructure.Persistence;
using MazadZone.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Polly;

public sealed class CategoryQueries : ResilientRepository, ICategoryQueries
{
    private readonly AppDbContext _context;

    public CategoryQueries(
        ISqlConnectionFactory sqlFactory,
        IAsyncPolicy resiliencePolicy,
        AppDbContext context,
        ILogger<CategoryQueries> logger)
        : base(sqlFactory, resiliencePolicy, logger)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<CategoryResponse>> GetRootCategoriesAsync(CancellationToken ct)
    {
        const string sql = @"
        SELECT
            ""Id"",
            ""Name"",
            ""Description"",
            ""ParentCategoryId"" as ""ParentId"" 
        FROM ""Categories"" 
        WHERE ""ParentCategoryId"" IS NULL AND ""IsDeleted"" = false;";

        return await ExecuteResilientAsync(async (connection, ct) =>
        {
            var result = await connection.QueryAsync<CategoryResponse>(
                new CommandDefinition(sql, cancellationToken: ct));
            return result.ToList();
        }, ct);

    }

    public async Task<IReadOnlyList<CategoryResponse>> GetSubCategoriesAsync(CategoryId parentId, CancellationToken ct)
    {
        const string sql = @"
        SELECT
            ""Id"",
            ""Name"",
            ""Description"",
            ""ParentCategoryId"" as ""ParentId"" 
        FROM ""Categories"" 
        WHERE ""ParentCategoryId"" = @ParentId AND ""IsDeleted"" = false;";

        return await ExecuteResilientAsync(async (connection, ct) =>
        {
            var result = await connection.QueryAsync<CategoryResponse>(
                new CommandDefinition(sql, new { ParentId = parentId.Value }, cancellationToken: ct));
            return result.ToList();
        }, ct);
    }

    public async Task<CategoryResponse?> GetByIdAsync(CategoryId id, CancellationToken ct)
    {
        const string sql = @"
        SELECT
            ""Id"",
            ""Name"",
            ""Description"",
            ""ParentCategoryId"" as ""ParentId"" 
        FROM ""Categories"" 
        WHERE ""Id"" = @CategoryId AND ""IsDeleted"" = false;";

        return await ExecuteResilientAsync(async (connection, ct) =>
                await connection.QueryFirstOrDefaultAsync<CategoryResponse>(
                    new CommandDefinition(sql, new { CategoryId = id.Value }, cancellationToken: ct)),
       ct);
    }

    public async Task<IReadOnlyList<BreadcrumbResponse>> GetBreadcrumbsAsync(CategoryId id, CancellationToken ct)
    {
        const string sql = @"
            WITH cat_path AS (
            SELECT 
                ""Id"", 
                ""Name"", 
                ""ParentCategoryId"", 
                1 AS ""Level""
            FROM ""Categories""
            WHERE ""Id"" = @CategoryId AND ""IsDeleted"" = false

            UNION ALL

            SELECT 
                c.""Id"", 
                c.""Name"", 
                c.""ParentCategoryId"", 
                cp.""Level"" + 1
            FROM ""Categories"" c
            INNER JOIN cat_path cp ON c.""Id"" = cp.""ParentCategoryId""
            WHERE c.""IsDeleted"" = false
        )
        SELECT ""Id"", ""Name"", ""Level"" 
        FROM cat_path 
        ORDER BY ""Level"" DESC;";

        return await ExecuteResilientAsync(async (connection, ct) =>
        {
            var result = await connection.QueryAsync<BreadcrumbResponse>(
                new CommandDefinition(sql, new { CategoryId = id.Value }, cancellationToken: ct));
            return result.ToList();
        }, ct);
    }

    public async Task<IReadOnlyList<CategoryTreeResponse>> GetTreeAsync(CancellationToken ct)
    {
        // Use EF Core instead of Dapper — EF Core's connection pool stays warm
        // and handles Neon PostgreSQL cold starts gracefully via its built-in retry.
        var flatList = await _context.Categories
            .AsNoTracking()
            .Select(c => new CategoryTreeResponse(
                c.Id.Value,
                EF.Property<string>(c, "Name"),
                EF.Property<string>(c, "Description"),
                c.ParentCategoryId != null ? (Guid?)c.ParentCategoryId.Value : null
            ))
            .ToListAsync(ct);

        var nodeMap = flatList.ToDictionary(
            n => n.Id, 
            n => new CategoryTreeResponse(n.Id, n.Name, n.Description, n.ParentId)
        );

        var rootNodes = new List<CategoryTreeResponse>();

        foreach (var node in nodeMap.Values)
        {
            if (node.ParentId.HasValue && nodeMap.TryGetValue(node.ParentId.Value, out var parentNode))
            {
                parentNode.Children.Add(node);
            }
            else if (!node.ParentId.HasValue)
            {
                rootNodes.Add(node);
            }
        }

        return rootNodes;
    }

    public async Task<IReadOnlyList<CategoryStatResponse>> GetCategoryStatisticsAsync(
    int limit, 
    bool includeOther, 
    CancellationToken ct)
{
    // 1. Base CTE to count and rank ALL categories
    // Notice we replaced 'a.Status = 2' with 'a.Status = @ActiveStatus'
    var sql = @"
        WITH CategoryCounts AS (
            SELECT 
                c.""Id"", 
                c.""Name"", 
                COUNT(a.""Id"") as ActiveAuctionsCount
            FROM ""Categories"" c
            LEFT JOIN ""Items"" i ON c.""Id"" = i.""CategoryId""
            LEFT JOIN ""Auctions"" a ON i.""AuctionId"" = a.""Id"" AND a.""Status"" = @ActiveStatus
            WHERE c.""IsDeleted"" = false
            GROUP BY c.""Id"", c.""Name""
        ),
        RankedCategories AS (
            SELECT 
                ""Id"", 
                ""Name"", 
                ActiveAuctionsCount,
                ROW_NUMBER() OVER(ORDER BY ActiveAuctionsCount DESC, ""Name"" ASC) as Rnk
            FROM CategoryCounts
        )
        
        SELECT 
            ""Id"", 
            ""Name"", 
            ActiveAuctionsCount 
        FROM (
            -- Always select the Top N
            SELECT 
                ""Id"", 
                ""Name"", 
                ActiveAuctionsCount,
                Rnk AS SortOrder
            FROM RankedCategories
            WHERE Rnk <= @Limit
    ";

    // 2. Conditionally append the "Other" bucket logic
    if (includeOther)
    {
        sql += @"
            UNION ALL

            SELECT 
                NULL AS ""Id"", 
                'Other' AS ""Name"", 
                SUM(ActiveAuctionsCount) AS ActiveAuctionsCount,
                @Limit + 1 AS SortOrder 
            FROM RankedCategories
            WHERE Rnk > @Limit
            HAVING COUNT(*) > 0 -- Ensures we don't generate an empty 'Other' row if total categories <= Limit
        ";
    }

    // 3. Close and sort the final result
    sql += @"
        ) FinalResult
        ORDER BY SortOrder ASC;
    ";

    return await ExecuteResilientAsync(async (connection, ct) =>
    {
        var parameters = new 
        { 
            Limit = limit,
            ActiveStatus = (int)AuctionStatus.Active 
        };

        var result = await connection.QueryAsync<CategoryStatResponse>(
            new CommandDefinition(sql, parameters, cancellationToken: ct)
        );

        return result.ToList().AsReadOnly();
    }, ct);
}


    public async Task<IReadOnlyList<CategoryResponse>> SearchByNameAsync(string name, CancellationToken ct)
    {
        const string sql = @"
            SELECT 
                ""Id"",
                ""Name"", 
                ""Description"",
                ""ParentCategoryId"" as ""ParentId"" 
            FROM ""Categories"" 
            WHERE ""Name"" ILIKE @SearchTerm AND ""IsDeleted"" = false";

        return await ExecuteResilientAsync(async (connection, ct) =>
        {
            var result = await connection.QueryAsync<CategoryResponse>(
                new CommandDefinition(sql, new { SearchTerm = $"%{name}%" }, cancellationToken: ct));
            return result.ToList();
        }, ct);
    }

    public async Task<IReadOnlyList<CategoryStatResponse>> GetRootCategoryStatisticsAsync(
    int limit, 
    bool includeOther, 
    CancellationToken ct)
{
    // 1. Base CTE to count and rank ONLY Root Categories
    // Notice the addition of 'AND c.ParentCategoryId IS NULL'
    var sql = @"
        WITH RootCategoryCounts AS (
            SELECT 
                c.""Id"", 
                c.""Name"", 
                COUNT(a.""Id"") as ActiveAuctionsCount
            FROM ""Categories"" c
            LEFT JOIN ""Items"" i ON c.""Id"" = i.""CategoryId""
            LEFT JOIN ""Auctions"" a ON i.""AuctionId"" = a.""Id"" AND a.""Status"" = @ActiveStatus
            WHERE c.""IsDeleted"" = false AND c.""ParentCategoryId"" IS NULL
            GROUP BY c.""Id"", c.""Name""
        ),
        RankedCategories AS (
            SELECT 
                ""Id"", 
                ""Name"", 
                ActiveAuctionsCount,
                ROW_NUMBER() OVER(ORDER BY ActiveAuctionsCount DESC, ""Name"" ASC) as Rnk
            FROM RootCategoryCounts
        )
        
        SELECT 
            ""Id"", 
            ""Name"", 
            ActiveAuctionsCount 
        FROM (
            -- Always select the Top N
            SELECT 
                ""Id"", 
                ""Name"", 
                ActiveAuctionsCount,
                Rnk AS SortOrder
            FROM RankedCategories
            WHERE Rnk <= @Limit
    ";

    // 2. Conditionally append the "Other" bucket logic
    if (includeOther)
    {
        sql += @"
            UNION ALL

            SELECT 
                NULL AS ""Id"", 
                'Other' AS ""Name"", 
                SUM(ActiveAuctionsCount) AS ActiveAuctionsCount,
                @Limit + 1 AS SortOrder 
            FROM RankedCategories
            WHERE Rnk > @Limit
            HAVING COUNT(*) > 0 
        ";
    }

    // 3. Close and sort the final result
    sql += @"
        ) FinalResult
        ORDER BY SortOrder ASC;
    ";

    return await ExecuteResilientAsync(async (connection, ct) =>
    {
        var parameters = new 
        { 
            Limit = limit,
            ActiveStatus = (int)AuctionStatus.Active 
        };

        var result = await connection.QueryAsync<CategoryStatResponse>(
            new CommandDefinition(sql, parameters, cancellationToken: ct)
        );

        return result.ToList().AsReadOnly();
    }, ct);
}


    private class CategoryNodeDto
    {
        public required CategoryTreeResponse Source { get; init; }
        public required List<CategoryTreeResponse> Children { get; init; }
    }
}