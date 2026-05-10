using MazadZone.Domain.Categories;

namespace MazadZone.Application.Features.Categories.Queries.GetBreadcrumbs;


public sealed class GetCategoryBreadcrumbsQueryHandler : IQueryHandler<GetCategoryBreadcrumbsQuery, IReadOnlyList<BreadcrumbResponse>>
{
    private readonly ICategoryQueries _categoryQueries;
    private readonly ILogger<GetCategoryBreadcrumbsQueryHandler> _logger;

    public GetCategoryBreadcrumbsQueryHandler(ICategoryQueries categoryQueries, ILogger<GetCategoryBreadcrumbsQueryHandler> logger)
    {
        _categoryQueries = categoryQueries;
        _logger = logger;
    }

    public async Task<Result<IReadOnlyList<BreadcrumbResponse>>> Handle(GetCategoryBreadcrumbsQuery request, CancellationToken ct)
    {
        var breadcrumbs = await _categoryQueries.GetBreadcrumbsAsync(request.CategoryId, ct);
        
        if (!breadcrumbs.Any())
        {
            GlobalLogs.LogCategoryNotFound(_logger, request.CategoryId);
            return CategoryErrors.NotFound;
        }

        GetCategoryBreadcrumbsLogs.LogSuccess(_logger, request.CategoryId);
        return Result.Success(breadcrumbs);
    }
}