namespace MazadZone.Application.Features.Categories.Queries.GetSubCategories;

public sealed class GetSubCategoriesQueryHandler : IQueryHandler<GetSubCategoriesQuery, IReadOnlyList<CategoryResponse>>
{
    private readonly ICategoryQueries _categoryQueries;
    private readonly ILogger<GetSubCategoriesQueryHandler> _logger;

    public GetSubCategoriesQueryHandler(ICategoryQueries categoryQueries, ILogger<GetSubCategoriesQueryHandler> logger)
    {
        _categoryQueries = categoryQueries;
        _logger = logger;
    }

    public async Task<Result<IReadOnlyList<CategoryResponse>>> Handle(GetSubCategoriesQuery request, CancellationToken ct)
    {
        var subCategories = await _categoryQueries.GetSubCategoriesAsync(request.ParentId, ct);
        
        GetSubCategoriesLogs.LogSuccess(_logger, request.ParentId);
        
        return Result.Success(subCategories ?? new List<CategoryResponse>().AsReadOnly());
    }
}