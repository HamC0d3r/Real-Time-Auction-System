namespace MazadZone.Infrastructure.Queries;

using Dapper;
using MazadZone.Application.Features.Categories.Queries;
using MazadZone.Domain.Categories;
using System.Data;

public sealed class CategoryQueries : ICategoryQueries
{
    private readonly IDbConnection _dbConnection;

    public CategoryQueries(IDbConnection dbConnection) => _dbConnection = dbConnection;

    public async Task<IReadOnlyList<CategoryResponse>> GetRootCategoriesAsync(CancellationToken ct)
    {
        const string sql = "SELECT id, name, description, parent_category_id as ParentId FROM categories WHERE parent_category_id IS NULL AND is_deleted = false";
        var result = await _dbConnection.QueryAsync<CategoryResponse>(new CommandDefinition(sql, cancellationToken: ct));
        return result.ToList();
    }

    public async Task<IReadOnlyList<CategoryResponse>> GetSubCategoriesAsync(CategoryId parentId, CancellationToken ct)
    {
        const string sql = "SELECT id, name, description, parent_category_id as ParentId FROM categories WHERE parent_category_id = @parentId AND is_deleted = false";
        var result =  await _dbConnection.QueryAsync<CategoryResponse>(new CommandDefinition(sql, new { parentId }, cancellationToken: ct));
        return result.ToList();
    }

    public async Task<CategoryResponse?> GetByIdAsync(CategoryId id, CancellationToken ct)
    {
        const string sql = "SELECT id, name, description, parent_category_id as ParentId FROM categories WHERE id = @id AND is_deleted = false";
        return  await _dbConnection.QueryFirstOrDefaultAsync<CategoryResponse>(new CommandDefinition(sql, new { id }, cancellationToken: ct));
    }

    public async Task<IReadOnlyList<BreadcrumbResponse>> GetBreadcrumbsAsync(CategoryId id, CancellationToken ct)
    {
        const string sql = @"
            WITH RECURSIVE cat_path AS (
                SELECT id, name, parent_category_id, 1 as level
                FROM categories
                WHERE id = @id
                UNION ALL
                SELECT c.id, c.name, c.parent_category_id, cp.level + 1
                FROM categories c
                JOIN cat_path cp ON c.id = cp.parent_category_id
            )
            SELECT id, name, level FROM cat_path ORDER BY level DESC";

        var result = await _dbConnection.QueryAsync<BreadcrumbResponse>(new CommandDefinition(sql, new { id }, cancellationToken: ct));
        return result.ToList();
    }

    public async Task<IReadOnlyList<CategoryTreeResponse>> GetTreeAsync(CancellationToken ct)
    {
        const string sql = "SELECT id, name, description, parent_category_id as ParentId FROM categories WHERE is_deleted = false";
        var flatList = await _dbConnection.QueryAsync<CategoryTreeResponse>(new CommandDefinition(sql, cancellationToken: ct));

        // Build tree in memory for performance
        var nodes = flatList.ToList();
        var dict = nodes.ToDictionary(n => n.Id, n => n with { Children = new List<CategoryTreeResponse>() });
        var rootNodes = new List<CategoryTreeResponse>();

        foreach (var node in dict.Values)
        {
            if (node.ParentId.HasValue && dict.TryGetValue(node.ParentId.Value, out var parent))
            {
                parent.Children.Add(node);
            }
            else if (!node.ParentId.HasValue)
            {
                rootNodes.Add(node);
            }
        }

        return rootNodes;
    }

    public async Task<IReadOnlyList<CategoryStatResponse>> GetCategoryStatisticsAsync(CancellationToken ct)
    {
        const string sql = @"
            SELECT c.id, c.name, COUNT(a.id) as ActiveAuctionsCount
            FROM categories c
            LEFT JOIN auctions a ON c.id = a.category_id AND a.status = 'Active'
            WHERE c.is_deleted = false
            GROUP BY c.id, c.name";
        
        var result = await _dbConnection.QueryAsync<CategoryStatResponse>(new CommandDefinition(sql, cancellationToken: ct));
        return result.ToList();
    }

    public async Task<IReadOnlyList<TrendingCategoryResponse>> GetTrendingCategoriesAsync(int limit, CancellationToken ct)
    {
        var since = DateTime.UtcNow.AddDays(-1);
        const string sql = @"
            SELECT c.id, c.name, COUNT(b.id) as InteractionCount
            FROM categories c
            JOIN auctions a ON c.id = a.category_id
            JOIN bids b ON a.id = b.auction_id
            WHERE b.created_at_utc >= @since AND c.is_deleted = false
            GROUP BY c.id, c.name
            ORDER BY InteractionCount DESC
            LIMIT @limit";

        var result = await _dbConnection.QueryAsync<TrendingCategoryResponse>(new CommandDefinition(sql, new { since, limit }, cancellationToken: ct));
        return result.ToList();
    }

    public async Task<IReadOnlyList<CategoryResponse>> SearchByNameAsync(string name, CancellationToken ct)
    {
        const string sql = @"
            SELECT id, name, description, parent_category_id as ParentId 
            FROM categories 
            WHERE name ILIKE @searchTerm AND is_deleted = false";
        
        var result =  await _dbConnection.QueryAsync<CategoryResponse>(new CommandDefinition(sql, new { searchTerm = $"%{name}%" }, cancellationToken: ct));
        return result.ToList();
    }
}