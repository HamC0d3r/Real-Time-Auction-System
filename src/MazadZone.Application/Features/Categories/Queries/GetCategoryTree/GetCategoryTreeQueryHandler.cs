namespace MazadZone.Application.Features.Categories.Queries.GetCategoryTree;


internal sealed class GetCategoryTreeQueryHandler : IQueryHandler<GetCategoryTreeQuery, IReadOnlyList<CategoryTreeResponse>>
{
    private readonly ICategoryQueries _categoryQueries;
    private readonly ILogger<GetCategoryTreeQueryHandler> _logger;

    public GetCategoryTreeQueryHandler(ICategoryQueries categoryQueries, ILogger<GetCategoryTreeQueryHandler> logger)
    {
        _categoryQueries = categoryQueries;
        _logger = logger;
    }

    public async Task<Result<IReadOnlyList<CategoryTreeResponse>>> Handle(GetCategoryTreeQuery request, CancellationToken ct)
    {
        var tree = await _categoryQueries.GetTreeAsync(ct);
        
        GetCategoryTreeLogs.LogSuccess(_logger);
        
        return Result.Success(tree);
    }
}