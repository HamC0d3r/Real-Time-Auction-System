using MazadZone.Domain.Repositories;
using MazadZone.Domain.Shared.Interfaces;

namespace MazadZone.Domain.Categories;
public interface ICategoryRepository : IGenericRepository<Category>, IScopedService
{
    Task<bool> ExistsAsync(CategoryId id, CancellationToken ct);

    Task<bool> ExistsWithNameInScopeAsync(
        string name,
        CategoryId? parentId,
        CategoryId? excludeId,
        CancellationToken ct);

}