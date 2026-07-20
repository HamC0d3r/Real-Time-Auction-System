namespace MazadZone.Infrastructure.Queries;

using Dapper;
using MazadZone.Application.Common.Interfaces;
using MazadZone.Application.Features.Categories.Queries;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Categories;
using MazadZone.Infrastructure.Repositories;
using Polly;

public sealed class CategoryQueries : ResilientRepository, ICategoryQueries
{
    public CategoryQueries(ISqlConnectionFactory sqlFactory, IAsyncPolicy resiliencePolicy)
        : base(sqlFactory, resiliencePolicy) { }

    public async Task<IReadOnlyList<CategoryResponse>> GetRootCategoriesAsync(CancellationToken ct)
    {
        const string sql = @"
        SELECT
            Id,
            Name,
            Description,
            ParentCategoryId as ParentId 
        FROM Categories 
        WHERE ParentCategoryId IS NULL AND IsDeleted = false;";

        return await ExecuteResilientAsync(async connection =>
        {
            // 1. Await the asynchronous query execution
            var result = await connection.QueryAsync<CategoryResponse>(sql);

            // 2. Materialize the collection into a list to satisfy IReadOnlyList<T>
            return result.ToList();
        });

    }

    public async Task<IReadOnlyList<CategoryResponse>> GetSubCategoriesAsync(CategoryId parentId, CancellationToken ct)
    {
        const string sql = @"
        SELECT
            Id,
            Name,
            Description,
            ParentCategoryId as ParentId 
        FROM Categories 
        WHERE ParentCategoryId = @ParentId AND IsDeleted = false;";

        return await ExecuteResilientAsync(async connection =>
        {
            var result = await connection.QueryAsync<CategoryResponse>(sql, new { ParentId = parentId.Value });
            return result.ToList();
        });
    }

    public async Task<CategoryResponse?> GetByIdAsync(CategoryId id, CancellationToken ct)
    {
        const string sql = @"
        SELECT
            Id,
            Name,
            Description,
            ParentCategoryId as ParentId 
        FROM Categories 
        WHERE id = @CategoryId AND IsDeleted = false;";

        return await ExecuteResilientAsync(connection =>
                connection.QueryFirstOrDefaultAsync<CategoryResponse>(sql, new { CategoryId = id.Value })
       );
    }

    public async Task<IReadOnlyList<BreadcrumbResponse>> GetBreadcrumbsAsync(CategoryId id, CancellationToken ct)
    {
        var connection = _connectionFactory.CreateConnection();

        const string sql = @"
            WITH cat_path AS (
            -- 1. Anchor Member: Start at the targeted deep subcategory
            SELECT 
                Id, 
                Name, 
                ParentCategoryId, 
                1 AS Level
            FROM Categories
            WHERE Id = @CategoryId AND IsDeleted = false

            UNION ALL

            -- 2. Recursive Member: Climb up to the parent categories
            SELECT 
                c.Id, 
                c.Name, 
                c.ParentCategoryId, 
                cp.Level + 1
            FROM Categories c
            INNER JOIN cat_path cp ON c.Id = cp.ParentCategoryId
            WHERE c.IsDeleted = false
        )
        -- 3. Final Selection: Order from the top root parent down to the child
        SELECT Id, Name, Level 
        FROM cat_path 
        ORDER BY Level DESC;";

        return await ExecuteResilientAsync(async connection =>
        {
            var result = await connection.QueryAsync<BreadcrumbResponse>(sql, new { CategoryId = id.Value });
            return result.ToList();
        });
    }

    public async Task<IReadOnlyList<CategoryTreeResponse>> GetTreeAsync(CancellationToken ct)
    {
        var connection = _connectionFactory.CreateConnection();

        const string sql = @"
       SELECT
            Id,
            Name,
            Description,
            ParentCategoryId AS  ParentId 
        FROM ""Categories"" 
        WHERE IsDeleted = false";

        return await ExecuteResilientAsync(async connection =>
    {
        var flatList = await connection.QueryAsync<CategoryTreeResponse>(
            new CommandDefinition(sql, cancellationToken: ct)
        );

        // 2. Pre-size the lists to optimize memory allocation boundaries
        var flatNodes = flatList.ToList();
        var dict = new Dictionary<Guid, CategoryNodeDto>(flatNodes.Count);
        var rootNodes = new List<CategoryTreeResponse>();

        // 3. Construct mutable middleman models to prevent record-sharing reference glitches
        foreach (var flatNode in flatNodes)
        {
            dict[flatNode.Id] = new CategoryNodeDto
            {
                Source = flatNode,
                Children = new List<CategoryTreeResponse>()
            };
        }

        // 4. Assemble relationships via lightning-fast pointer mapping references
        foreach (var item in dict.Values)
        {
            var currentFlat = item.Source;

            // If it has a parent and that parent is present in our active dataset
            if (currentFlat.ParentId.HasValue && dict.TryGetValue(currentFlat.ParentId.Value, out var parentNode))
            {
                // Reconstruct the node state with its running compiled children links
                var fullyBuiltNode = currentFlat with { Children = item.Children };
                parentNode.Children.Add(fullyBuiltNode);
            }
            else if (!currentFlat.ParentId.HasValue)
            {
                // Root elements map out directly to our response stack tracking
                var fullyBuiltRoot = currentFlat with { Children = item.Children };
                rootNodes.Add(fullyBuiltRoot);
            }
        }

        return rootNodes;
    });
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
                c.Id, 
                c.Name, 
                COUNT(a.Id) as ActiveAuctionsCount
            FROM Categories c
            LEFT JOIN Items i ON c.Id = i.CategoryId
            LEFT JOIN Auctions a ON i.AuctionId = a.Id AND a.Status = @ActiveStatus
            WHERE c.IsDeleted = false
            GROUP BY c.Id, c.Name
        ),
        RankedCategories AS (
            SELECT 
                Id, 
                Name, 
                ActiveAuctionsCount,
                ROW_NUMBER() OVER(ORDER BY ActiveAuctionsCount DESC, Name ASC) as Rnk
            FROM CategoryCounts
        )
        
        SELECT 
            Id, 
            Name, 
            ActiveAuctionsCount 
        FROM (
            -- Always select the Top N
            SELECT 
                Id, 
                Name, 
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
                NULL AS Id, 
                'Other' AS Name, 
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

    return await ExecuteResilientAsync(async connection =>
    {
        // Map the parameters safely to Dapper, casting the Enum to an integer
        var parameters = new 
        { 
            Limit = limit,
            ActiveStatus = (int)AuctionStatus.Active 
        };

        var result = await connection.QueryAsync<CategoryStatResponse>(
            new CommandDefinition(sql, parameters, cancellationToken: ct)
        );

        return result.ToList().AsReadOnly();
    });
}


    public async Task<IReadOnlyList<CategoryResponse>> SearchByNameAsync(string name, CancellationToken ct)
    {
        var connection = _connectionFactory.CreateConnection();

        const string sql = @"
            SELECT 
                Id,
                Name, 
                Description,
                ParentCategoryId as ParentId 
            FROM Categories 
            WHERE Name LIKE @SearchTerm AND IsDeleted = false";

        return await ExecuteResilientAsync(async connection =>
        {
            var result = await connection.QueryAsync<CategoryResponse>(new CommandDefinition(sql, new { SearchTerm = $"%{name}%" }, cancellationToken: ct));
            return result.ToList();
        });
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
                c.Id, 
                c.Name, 
                COUNT(a.Id) as ActiveAuctionsCount
            FROM Categories c
            LEFT JOIN Items i ON c.Id = i.CategoryId
            LEFT JOIN Auctions a ON i.AuctionId = a.Id AND a.Status = @ActiveStatus
            WHERE c.IsDeleted = false AND c.ParentCategoryId IS NULL
            GROUP BY c.Id, c.Name
        ),
        RankedCategories AS (
            SELECT 
                Id, 
                Name, 
                ActiveAuctionsCount,
                ROW_NUMBER() OVER(ORDER BY ActiveAuctionsCount DESC, Name ASC) as Rnk
            FROM RootCategoryCounts
        )
        
        SELECT 
            Id, 
            Name, 
            ActiveAuctionsCount 
        FROM (
            -- Always select the Top N
            SELECT 
                Id, 
                Name, 
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
                NULL AS Id, 
                'Other' AS Name, 
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

    return await ExecuteResilientAsync(async connection =>
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
    });
}


    private class CategoryNodeDto
    {
        public required CategoryTreeResponse Source { get; init; }
        public required List<CategoryTreeResponse> Children { get; init; }
    }
}