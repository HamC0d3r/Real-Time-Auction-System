using MazadZone.Domain.Shared.Interfaces;

namespace MazadZone.Domain.Categories;
public interface ICategoryDomainService : IScopedService
{
    Task<Result> ChangeParentAsync(Category category, CategoryId? newParentId, CancellationToken ct);
    Task<Result> IsNameUniqueInScopeAsync(string name, CategoryId? parentId, CategoryId? excludeId, CancellationToken ct);
    Task<Result> ValidateParentExistsAsync(CategoryId? parentId, CancellationToken ct);
}