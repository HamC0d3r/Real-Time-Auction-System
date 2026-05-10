namespace MazadZone.Application.Features.Categories.Commands.Create;

using MazadZone.Domain.Categories;

public sealed class CreateCategoryCommandHandler : ICommandHandler<CreateCategoryCommand, Guid>
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly ICategoryDomainService _categoryDomainService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreateCategoryCommandHandler> _logger;

    public CreateCategoryCommandHandler(
        ICategoryRepository categoryRepository,
        IUnitOfWork unitOfWork,
        ICategoryDomainService categoryDomainService,
        ILogger<CreateCategoryCommandHandler> logger)
    {
        _categoryRepository = categoryRepository;
        _categoryDomainService = categoryDomainService;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<Guid>> Handle(CreateCategoryCommand request, CancellationToken ct)
    {
        CategoryId? parentId = request.ParentCategoryId.HasValue ? request.ParentCategoryId : null;

        var parentExistsResult = await _categoryDomainService.ValidateParentExistsAsync(parentId, ct);
        if (parentExistsResult.IsFailure)
        {
            GlobalLogs.LogCategoryNotFound(_logger, request.ParentCategoryId!.Value);
            return parentExistsResult.TopError;
        }

        var uniquenessResult = await _categoryDomainService.IsNameUniqueInScopeAsync(
            request.Name,
            parentId,
            null, // No ID to exclude for new categories
            ct);

        if (uniquenessResult.IsFailure)
        {
            CategoryLogs.LogDuplicateName(_logger, request.Name, request.ParentCategoryId);
            return uniquenessResult.TopError;
        }

        var result = Category.Create(request.Name, request.Description, parentId);

        if (result.IsFailure)
        {
            CreateCategoryLogs.LogDomainRuleViolation(_logger, result.TopError.Code, result.TopError.Message);
            return result.TopError;
        }

        _categoryRepository.Add(result.Value);

        await _unitOfWork.SaveChangesAsync(ct);

        CreateCategoryLogs.LogSuccess(_logger, result.Value.Id);

        return result.Value.Id.Value;
    }
}