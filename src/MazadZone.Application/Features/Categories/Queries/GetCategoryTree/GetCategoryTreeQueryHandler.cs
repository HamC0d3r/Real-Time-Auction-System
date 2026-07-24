namespace MazadZone.Application.Features.Categories.Queries.GetCategoryTree;

using Microsoft.Extensions.Caching.Memory;

public sealed class GetCategoryTreeQueryHandler : IQueryHandler<GetCategoryTreeQuery, IReadOnlyList<CategoryTreeResponse>>
{
    private const string CacheKey = "category-tree";
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(10);

    private readonly ICategoryQueries _categoryQueries;
    private readonly ILogger<GetCategoryTreeQueryHandler> _logger;
    private readonly IMemoryCache _cache;

    public GetCategoryTreeQueryHandler(
        ICategoryQueries categoryQueries,
        ILogger<GetCategoryTreeQueryHandler> logger,
        IMemoryCache cache)
    {
        _categoryQueries = categoryQueries;
        _logger = logger;
        _cache = cache;
    }

    public async Task<Result<IReadOnlyList<CategoryTreeResponse>>> Handle(GetCategoryTreeQuery request, CancellationToken ct)
    {
        if (_cache.TryGetValue<IReadOnlyList<CategoryTreeResponse>>(CacheKey, out var cached))
        {
            GetCategoryTreeLogs.LogCacheHit(_logger);
            return Result.Success(cached!);
        }

        var tree = await _categoryQueries.GetTreeAsync(ct);

        _cache.Set(CacheKey, tree, CacheDuration);
        GetCategoryTreeLogs.LogSuccess(_logger);

        return Result.Success(tree);
    }
}