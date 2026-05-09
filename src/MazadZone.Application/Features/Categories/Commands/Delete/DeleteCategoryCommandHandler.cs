namespace MazadZone.Application.Features.Categories.Commands.Delete;

using MazadZone.Domain.Categories;

internal sealed class DeleteCategoryCommandHandler : ICommandHandler<DeleteCategoryCommand, Unit>
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<DeleteCategoryCommandHandler> _logger;

    public DeleteCategoryCommandHandler(
        ICategoryRepository categoryRepository,
        IUnitOfWork unitOfWork,
        ILogger<DeleteCategoryCommandHandler> logger)
    {
        _categoryRepository = categoryRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(DeleteCategoryCommand request, CancellationToken ct)
    {
        // Must use a repository method that includes children for recursive soft delete
        var category = await _categoryRepository.GetByIdAsync(request.CategoryId.Value, ct);

        if (category is null)
        {
            GlobalLogs.LogCategoryNotFound(_logger, request.CategoryId);
            return CategoryErrors.NotFound;
        }

        var result = category.Delete();
        if (result.IsFailure)
        {
            DeleteCategoryLogs.LogDomainRuleViolation(_logger, result.TopError.Code, result.TopError.Message);
            return result.TopError;
        }

        await _unitOfWork.SaveChangesAsync(ct);

        DeleteCategoryLogs.LogSuccess(_logger, category.Id);
        return Unit.Value;
    }
}