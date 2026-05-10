namespace MazadZone.Application.Features.Categories.Commands.AddSubCategory;

using MazadZone.Domain.Categories;

public sealed class AddSubCategoryCommandHandler : ICommandHandler<AddSubCategoryCommand, Unit>
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AddSubCategoryCommandHandler> _logger;

    public AddSubCategoryCommandHandler(
        ICategoryRepository categoryRepository,
        IUnitOfWork unitOfWork,
        ILogger<AddSubCategoryCommandHandler> logger)
    {
        _categoryRepository = categoryRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(AddSubCategoryCommand request, CancellationToken ct)
    {
        var parent = await _categoryRepository.GetByIdAsync(request.ParentId.Value, ct);
        if (parent is null)
        {
            GlobalLogs.LogCategoryNotFound(_logger, request.ParentId);
            return CategoryErrors.NotFound;
        }

        var subCategory = await _categoryRepository.GetByIdAsync(request.SubCategoryId.Value, ct);
        if (subCategory is null)
        {
            GlobalLogs.LogCategoryNotFound(_logger, request.SubCategoryId);
            return CategoryErrors.NotFound;
        }

        var result = parent.AddSubCategory(subCategory);

        if (result.IsFailure)
        {
            AddSubCategoryLogs.LogDomainRuleViolation(_logger, result.TopError.Code, result.TopError.Message);
            return result.TopError;
        }

        await _unitOfWork.SaveChangesAsync(ct);

        AddSubCategoryLogs.LogSuccess(_logger, parent.Id, subCategory.Id);

        return Unit.Value;
    }
}