using MazadZone.Domain.Categories;

namespace MazadZone.Application.Features.Categories.Commands.MoveToParent;

internal sealed class MoveToParentCommandHandler : ICommandHandler<MoveToParentCommand, Unit>
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly CategoryDomainService _categoryDomainService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<MoveToParentCommandHandler> _logger;

    public MoveToParentCommandHandler(
        ICategoryRepository categoryRepository,
        CategoryDomainService categoryDomainService,
        IUnitOfWork unitOfWork,
        ILogger<MoveToParentCommandHandler> logger)
    {
        _categoryRepository = categoryRepository;
        _categoryDomainService = categoryDomainService;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(MoveToParentCommand request, CancellationToken ct)
    {
        var category = await _categoryRepository.GetByIdAsync(request.CategoryId.Value, ct);

        if (category is null)
        {
            GlobalLogs.LogCategoryNotFound(_logger, request.CategoryId);
            return CategoryErrors.NotFound;
        }

        CategoryId? newParentId = request.NewParentId.HasValue ? request.NewParentId : null; 

        var checkResult = await _categoryDomainService.ChangeParentAsync(category, newParentId, ct);
        if (checkResult.IsFailure)
        {
            MoveToParentLogs.LogDomainRuleViolation(
                _logger,
                request.CategoryId,
                checkResult.TopError.Code,
                checkResult.TopError.Message);

            return checkResult.TopError;
        }

        var result = category.MoveToParent(newParentId);
        if (result.IsFailure)
        {
            MoveToParentLogs.LogDomainRuleViolation(_logger,request.CategoryId, result.TopError.Code, result.TopError.Message);
            return result.TopError;
        }

        await _unitOfWork.SaveChangesAsync(ct);

        MoveToParentLogs.LogSuccess(_logger, category.Id);

        return Unit.Value;
    }
}