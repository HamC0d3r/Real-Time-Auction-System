namespace MazadZone.Application.Features.Categories.Queries.SearchCategories;

public sealed class SearchCategoriesQueryHandler : IQueryHandler<SearchCategoriesQuery, IReadOnlyList<CategoryResponse>>
{
    private readonly ICategoryQueries _categoryQueries;
    private readonly ILogger<SearchCategoriesQueryHandler> _logger;

    public SearchCategoriesQueryHandler(ICategoryQueries categoryQueries, ILogger<SearchCategoriesQueryHandler> logger)
    {
        _categoryQueries = categoryQueries;
        _logger = logger;
    }

    public async Task<Result<IReadOnlyList<CategoryResponse>>> Handle(SearchCategoriesQuery request, CancellationToken ct)
    {
        var results = await _categoryQueries.SearchByNameAsync(request.SearchTerm, ct);
        SearchCategoriesLogs.LogSuccess(_logger, request.SearchTerm);
        return Result.Success(results ?? new List<CategoryResponse>().AsReadOnly());
    }
}