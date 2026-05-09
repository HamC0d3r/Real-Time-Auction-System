namespace MazadZone.Application.Features.Categories.Commands.Restore;

using MazadZone.Domain.Categories;

internal sealed class RestoreCategoryCommandHandler : ICommandHandler<RestoreCategoryCommand, Unit>
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<RestoreCategoryCommandHandler> _logger;

    public RestoreCategoryCommandHandler(
        ICategoryRepository categoryRepository,
        IUnitOfWork unitOfWork,
        ILogger<RestoreCategoryCommandHandler> logger)
    {
        _categoryRepository = categoryRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(RestoreCategoryCommand request, CancellationToken ct)
    {
        var category = await _categoryRepository.GetByIdAsync(request.CategoryId.Value, ct);

        if (category is null)
        {
            GlobalLogs.LogCategoryNotFound(_logger, request.CategoryId);
            return CategoryErrors.NotFound;
        }

        var result = category.Restore();
        if (result.IsFailure)
        {
            RestoreCategoryLogs.LogDomainRuleViolation(_logger,request.CategoryId, result.TopError.Code, result.TopError.Message);
            return result.TopError;
        }

        await _unitOfWork.SaveChangesAsync(ct);

        RestoreCategoryLogs.LogSuccess(_logger, category.Id);

        return Unit.Value;
    }
}