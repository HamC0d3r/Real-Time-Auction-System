namespace MazadZone.Application.Features.Categories.Queries.GetById;

using MazadZone.Domain.Categories;

public sealed class GetCategoryByIdQueryHandler : IQueryHandler<GetCategoryByIdQuery, CategoryResponse>
{
    private readonly ICategoryQueries _categoryQueries;
    private readonly ILogger<GetCategoryByIdQueryHandler> _logger;

    public GetCategoryByIdQueryHandler(ICategoryQueries categoryQueries, ILogger<GetCategoryByIdQueryHandler> logger)
    {
        _categoryQueries = categoryQueries;
        _logger = logger;
    }

    public async Task<Result<CategoryResponse>> Handle(GetCategoryByIdQuery request, CancellationToken ct)
    {
        var category = await _categoryQueries.GetByIdAsync(request.CategoryId, ct);

        if (category is null)
        {
            GlobalLogs.LogCategoryNotFound(_logger, request.CategoryId);
            return CategoryErrors.NotFound;
        }

        GetCategoryByIdLogs.LogSuccess(_logger, request.CategoryId);
        
        return Result.Success(category);
    }
}