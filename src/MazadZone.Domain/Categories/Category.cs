namespace MazadZone.Domain.Entities.Categories;

using MazadZone.Domain.Auctions;
using MazadZone.Domain.Categories;
using MazadZone.Domain.Primitives;

public sealed class Category : AggregateRoot<CategoryId>
{
    private readonly List<Category> _subCategories = new();

    private Category() { }

    private Category(CategoryId id, string name, string description, CategoryId? parentCategoryId) : base(id)
    {
        Name = name;
        Description = description;
        ParentCategoryId = parentCategoryId;
    }

    public string Name { get; private set; }
    public string Description { get; private set; }
    
    // The core of the hierarchy
    public CategoryId? ParentCategoryId { get; private set; }
    public IReadOnlyCollection<Category> SubCategories => _subCategories.AsReadOnly();

    public bool IsRootCategory => ParentCategoryId is null;

    // --- Factory Method ---
    public static Category Create(string name, string description, CategoryId? parentCategoryId = null)
    {
        return new Category(new CategoryId(Guid.NewGuid()), name, description, parentCategoryId);
    }

    // --- Operations ---
    public Result MoveToParent(CategoryId? newParentId)
    {
        // Prevent a category from being its own parent
        if (newParentId.HasValue && newParentId.Value == this.Id)
        {
            return Result.Failure(CategoryErrors.InvalidParentCategory);
        }

        ParentCategoryId = newParentId;
        return Result.Success();
    }
}