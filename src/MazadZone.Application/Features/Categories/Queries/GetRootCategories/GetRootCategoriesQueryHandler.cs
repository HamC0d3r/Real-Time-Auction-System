namespace MazadZone.Application.Features.Categories.Queries.GetRootCategories;

public sealed class GetRootCategoriesQueryHandler : IQueryHandler<GetRootCategoriesQuery, IReadOnlyList<CategoryResponse>>
{
    private readonly ICategoryQueries _categoryQueries;
    private readonly ILogger<GetRootCategoriesQueryHandler> _logger;

    public GetRootCategoriesQueryHandler(ICategoryQueries categoryQueries, ILogger<GetRootCategoriesQueryHandler> logger)
    {
        _categoryQueries = categoryQueries;
        _logger = logger;
    }

    public async Task<Result<IReadOnlyList<CategoryResponse>>> Handle(GetRootCategoriesQuery request, CancellationToken ct)
    {
        var categories = await _categoryQueries.GetRootCategoriesAsync(ct);
        
        GetRootCategoriesLogs.LogSuccess(_logger);
        
        return Result.Success(categories ?? new List<CategoryResponse>().AsReadOnly());
    }
}