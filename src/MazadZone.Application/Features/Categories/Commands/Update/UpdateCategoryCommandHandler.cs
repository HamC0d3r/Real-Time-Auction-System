namespace MazadZone.Application.Features.Categories.Commands.Update;

using MazadZone.Domain.Categories;
using MazadZone.Domain.Shared.ValueObjects;

internal sealed class UpdateCategoryCommandHandler : ICommandHandler<UpdateCategoryCommand, Unit>
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UpdateCategoryCommandHandler> _logger;

    public UpdateCategoryCommandHandler(
        ICategoryRepository categoryRepository,
        IUnitOfWork unitOfWork,
        ILogger<UpdateCategoryCommandHandler> logger)
    {
        _categoryRepository = categoryRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(UpdateCategoryCommand request, CancellationToken ct)
    {
        var category = await _categoryRepository.GetByIdAsync(request.CategoryId.Value, ct);

        if (category is null)
        {
            GlobalLogs.LogCategoryNotFound(_logger, request.CategoryId);
            return CategoryErrors.NotFound;
        }

        var nameResult = Name.Create(request.Name);
        if(nameResult.IsFailure) return nameResult.TopError;

        var descriptionResult = Description.Create(request.Description);
        if (descriptionResult.IsFailure) return descriptionResult.TopError;


        category.Update(nameResult.Value, descriptionResult.Value);

        await _unitOfWork.SaveChangesAsync(ct);

        UpdateCategoryLogs.LogSuccess(_logger, category.Id);

        return Unit.Value;
    }
}