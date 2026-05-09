using MazadZone.Domain.Categories;
using MazadZone.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace MazadZone.Infrastructure.Repositories;

public sealed class CategoryRepository : GenericRepository<Category>, ICategoryRepository
{
    private readonly AppDbContext _context;

    public CategoryRepository(AppDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<bool> ExistsAsync(CategoryId id, CancellationToken ct)
    {
        return await _context.Set<Category>()
            .AnyAsync(c => c.Id == id, ct);
    }

    public async Task<bool> ExistsWithNameInScopeAsync(
        string name,
        CategoryId? parentId,
        CategoryId? excludeId,
        CancellationToken ct)
    {
        return await _context.Set<Category>()
            .AnyAsync(c => 
                // 1. Match the name (case-insensitive depends on DB collation)
                c.Name.Value == name &&
                
                // 2. Match the parent (Handles both null and specific IDs)
                c.ParentCategoryId == parentId &&
                
                // 3. Exclude the current category during an Update 
                // (so it doesn't conflict with itself)
                (excludeId == null || c.Id != excludeId), 
                ct);
    }
}