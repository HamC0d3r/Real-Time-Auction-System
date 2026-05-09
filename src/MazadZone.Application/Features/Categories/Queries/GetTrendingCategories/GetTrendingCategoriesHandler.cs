namespace MazadZone.Application.Features.Categories.Queries.GetTrendingCategories;


internal sealed class GetTrendingCategoriesQueryHandler : IQueryHandler<GetTrendingCategoriesQuery, IReadOnlyList<TrendingCategoryResponse>>
{
    private readonly ICategoryQueries _categoryQueries;
    private readonly ILogger<GetTrendingCategoriesQueryHandler> _logger;

    public GetTrendingCategoriesQueryHandler(ICategoryQueries categoryQueries, ILogger<GetTrendingCategoriesQueryHandler> logger)
    {
        _categoryQueries = categoryQueries;
        _logger = logger;
    }

    public async Task<Result<IReadOnlyList<TrendingCategoryResponse>>> Handle(GetTrendingCategoriesQuery request, CancellationToken ct)
    {
        var trending = await _categoryQueries.GetTrendingCategoriesAsync(request.Limit, ct);
        GetTrendingCategoriesLogs.LogSuccess(_logger, request.Limit);
        return Result.Success(trending);
    }
}