namespace MazadZone.Application.Features.Categories.Queries.GetCategoryStatistics;

public sealed class GetCategoryStatisticsQueryHandler : IQueryHandler<GetCategoryStatisticsQuery, IReadOnlyList<CategoryStatResponse>>
{
    private readonly ICategoryQueries _categoryQueries;
    private readonly ILogger<GetCategoryStatisticsQueryHandler> _logger;

    public GetCategoryStatisticsQueryHandler(ICategoryQueries categoryQueries, ILogger<GetCategoryStatisticsQueryHandler> logger)
    {
        _categoryQueries = categoryQueries;
        _logger = logger;
    }

    public async Task<Result<IReadOnlyList<CategoryStatResponse>>> Handle(GetCategoryStatisticsQuery request, CancellationToken ct)
    {
        var stats = await _categoryQueries.GetCategoryStatisticsAsync(ct);
        GetCategoryStatisticsLogs.LogSuccess(_logger);
        return Result.Success(stats);
    }
}