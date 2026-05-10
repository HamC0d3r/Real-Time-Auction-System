namespace MazadZone.Domain.Categories;

using System;
using MazadZone.Domain.Primitives;
using MazadZone.Domain.Shared.ValueObjects;

public sealed class Category : AggregateRoot<CategoryId>, ISoftDeletable
{
    private readonly HashSet<Category> _subCategories = new();

    private Category() { }


    private Category(CategoryId id, Name name, Description description, CategoryId? parentCategoryId) : base(id)
    {
        Name = name;
        Description = description;
        ParentCategoryId = parentCategoryId;
    }

    public Name Name { get; private set; }
    public Description Description { get; private set; }
    
    public CategoryId? ParentCategoryId { get; private set; }
    public IReadOnlyCollection< Category> SubCategories => _subCategories;

    public bool IsRootCategory => ParentCategoryId is null;

    public bool IsDeleted { get; private set; }

    public DateTime? DeletedOnUtc { get; private set; }

    public static Result<Category> Create(string name, string description, CategoryId? parentCategoryId = null)
    {
        var nameResult = Name.Create(name);
        if (nameResult.IsFailure) return nameResult.TopError;

        var descriptionResult = Description.Create(description);
        if (descriptionResult.IsFailure) return descriptionResult.TopError;


        return new Category(CategoryId.New(), nameResult.Value, descriptionResult.Value, parentCategoryId);
    }

    public Result Delete()
    {
        if (IsDeleted) return Result.Success();

        IsDeleted = true;
        DeletedOnUtc = DateTime.UtcNow;

        foreach (var subCategory in _subCategories)
        {
            subCategory.Delete();
        }
        
        return Result.Success();
    }
    public Result Restore()
    {
        if (!IsDeleted) return Result.Success();

        IsDeleted = false;
        DeletedOnUtc = null;

        return Result.Success();
    }

    public Result MoveToParent(CategoryId? newParentId)
    {
        // Prevent a category from being its own parent
        if (newParentId is not null && newParentId == this.Id)
        {
            return CategoryErrors.SelfReference;
        }

        ParentCategoryId = newParentId;
        return Result.Success();
    }

    public Result AddSubCategory(Category subCategory)
    {
        if (subCategory.ParentCategoryId != this.Id)
            return CategoryErrors.InvalidParent;

        // HashSet automatically handles duplicates efficiently!
        // .Add() returns true if it was added, false if it was already there.
        bool wasAdded = _subCategories.Add(subCategory);

        if (!wasAdded)
        {
            return CategoryErrors.AlreadyExists;
        }

        return Result.Success();
    }

    public void MakeRootCategory()
    {
        if (IsRootCategory) return;

        ParentCategoryId = null;
    }

    public void Update(Name newName, Description newDescription)
    {
        if (Name.Value == newName && Description.Value == newDescription) return;

        Name = newName;
        Description = newDescription;
    }
    
}