namespace MazadZone.Application.Features.Categories.Commands.MakeRootCategory;

using MazadZone.Domain.Categories;

internal sealed class MakeRootCategoryCommandHandler : ICommandHandler<MakeRootCategoryCommand, Unit>
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<MakeRootCategoryCommandHandler> _logger;

    public MakeRootCategoryCommandHandler(
        ICategoryRepository categoryRepository,
        IUnitOfWork unitOfWork,
        ILogger<MakeRootCategoryCommandHandler> logger)
    {
        _categoryRepository = categoryRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(MakeRootCategoryCommand request, CancellationToken ct)
    {
        var category = await _categoryRepository.GetByIdAsync(request.CategoryId.Value, ct);

        if (category is null)
        {
            GlobalLogs.LogCategoryNotFound(_logger, request.CategoryId);
            return CategoryErrors.NotFound;
        }

        var result = category.MakeRootCategory();

        if (result.IsFailure)
        {
            MakeRootCategoryLogs.LogDomainRuleViolation(
                _logger,
                request.CategoryId,
                result.TopError.Code,
                result.TopError.Message);

            return result.TopError;
        }

        await _unitOfWork.SaveChangesAsync(ct);

        MakeRootCategoryLogs.LogSuccess(_logger, category.Id);

        return Unit.Value;
    }
}