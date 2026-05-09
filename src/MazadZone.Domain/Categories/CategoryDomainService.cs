using MazadZone.Domain.Categories;
using MazadZone.Domain.Shared.Interfaces;

public class CategoryDomainService : IScopedService
{
    private readonly ICategoryRepository _categoryRepository;

    public CategoryDomainService(ICategoryRepository categoryRepository)
    {
        _categoryRepository = categoryRepository;
    }

    public async Task<Result> ChangeParentAsync(Category category, CategoryId? newParentId, CancellationToken ct)
    {
        if (newParentId is null) return category.MoveToParent(null);

        // 1. Basic check: Cannot be its own parent
        if (category.Id == newParentId) return CategoryErrors.SelfReference;

        // 2. Circularity check: Walk up from the potential new parent to the root
        var currentParentId = newParentId;
        while (currentParentId != null)
        {
            if (currentParentId == category.Id)
            {
                return CategoryErrors.CircularReference; // Loop detected!
            }

            // Get the parent of the current category in the loop
            var parent = await _categoryRepository.GetByIdAsync(currentParentId.Value.Value, ct);
            currentParentId = parent?.ParentCategoryId;
        }

        return category.MoveToParent(newParentId);
    }

    // Rule 2: Prevent Duplicate Names in the same branch (Uniqueness Logic)
    public async Task<Result> IsNameUniqueInScopeAsync(
        string name,
        CategoryId? parentId,
        CategoryId? currentCategoryId = null,
        CancellationToken ct = default)
    {
        bool exists = await _categoryRepository.ExistsWithNameInScopeAsync(
            name,
            parentId,
            currentCategoryId,
            ct);

        if (exists)
        {
            return CategoryErrors.DuplicateName;
        }

        return Result.Success();
    }

public async Task<Result> ValidateParentExistsAsync(CategoryId? parentId, CancellationToken ct)
{
    // If parentId is null, it's a Root Category. 
    // We don't need to check the database.
    if (parentId is null) return Result.Success();

    bool exists = await _categoryRepository.ExistsAsync(parentId.Value, ct);

    if (!exists)
    {
        return CategoryErrors.NotFound;
    }

    return Result.Success();
}
}